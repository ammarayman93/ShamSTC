using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ISPSystem.Services
{
    public class PermissionService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public PermissionService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        /// <summary>Admin يتجاوز كل الصلاحيات دائماً</summary>
        public static bool IsAdminRole(string role) =>
            string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);

        public async Task<List<Permission>> GetAllPermissionsAsync()
        {
            return await _context.Permissions
                .OrderBy(p => p.Group)
                .ThenBy(p => p.SortOrder)
                .ThenBy(p => p.Code)
                .ToListAsync();
        }

        public async Task<List<string>> GetRolePermissionCodesAsync(string role)
        {
            if (string.IsNullOrWhiteSpace(role))
                return new List<string>();

            if (IsAdminRole(role))
            {
                return await _context.Permissions.Select(p => p.Code).ToListAsync();
            }

            return await _context.RolePermissions
                .Where(rp => rp.Role == role)
                .Select(rp => rp.Permission.Code)
                .ToListAsync();
        }

        /// <summary>
        /// الصلاحيات الفعلية للمستخدم:
        /// Admin → الكل
        /// وإلا: صلاحيات الدور ∪ الممنوحة للمستخدم − الممنوعة عن المستخدم
        /// </summary>
        public async Task<HashSet<string>> GetEffectivePermissionsAsync(int userId)
        {
            var cacheKey = $"perm:user:{userId}";
            if (_cache.TryGetValue(cacheKey, out HashSet<string> cached))
                return cached;

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            HashSet<string> result;

            if (IsAdminRole(user.Role))
            {
                var all = await _context.Permissions.Select(p => p.Code).ToListAsync();
                result = new HashSet<string>(all, StringComparer.OrdinalIgnoreCase);
            }
            else
            {
                var roleCodes = await _context.RolePermissions
                    .Where(rp => rp.Role == user.Role)
                    .Select(rp => rp.Permission.Code)
                    .ToListAsync();

                result = new HashSet<string>(roleCodes, StringComparer.OrdinalIgnoreCase);

                var overrides = await _context.UserPermissions
                    .Where(up => up.UserId == userId)
                    .Select(up => new { up.IsGranted, Code = up.Permission.Code })
                    .ToListAsync();

                foreach (var o in overrides)
                {
                    if (o.IsGranted)
                        result.Add(o.Code);
                    else
                        result.Remove(o.Code);
                }
            }

            _cache.Set(cacheKey, result, CacheDuration);
            return result;
        }

        public async Task<bool> HasAsync(int userId, string permissionCode)
        {
            if (string.IsNullOrWhiteSpace(permissionCode))
                return false;

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;
            if (IsAdminRole(user.Role)) return true;

            var set = await GetEffectivePermissionsAsync(userId);
            return set.Contains(permissionCode);
        }

        public async Task<bool> HasAnyAsync(int userId, params string[] codes)
        {
            if (codes == null || codes.Length == 0) return false;
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;
            if (IsAdminRole(user.Role)) return true;

            var set = await GetEffectivePermissionsAsync(userId);
            return codes.Any(c => set.Contains(c));
        }

        public void InvalidateUser(int userId)
        {
            _cache.Remove($"perm:user:{userId}");
        }

        /// <summary>تعيين تخصيصات المستخدم (يستبدل السابقة)</summary>
        public async Task SetUserPermissionsAsync(int userId, IEnumerable<UserPermissionItem> items)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("المستخدم غير موجود");

            // Admin لا يحتاج تخصيصاً — نمسح أي تخصيصات قديمة
            var existing = await _context.UserPermissions.Where(up => up.UserId == userId).ToListAsync();
            _context.UserPermissions.RemoveRange(existing);

            if (!IsAdminRole(user.Role) && items != null)
            {
                var permMap = await _context.Permissions
                    .ToDictionaryAsync(p => p.Code, p => p.Id, StringComparer.OrdinalIgnoreCase);

                foreach (var item in items)
                {
                    if (string.IsNullOrWhiteSpace(item.Code) || !permMap.TryGetValue(item.Code, out var pid))
                        continue;

                    _context.UserPermissions.Add(new UserPermission
                    {
                        UserId = userId,
                        PermissionId = pid,
                        IsGranted = item.IsGranted
                    });
                }
            }

            await _context.SaveChangesAsync();
            InvalidateUser(userId);
        }

        public async Task<object> GetUserPermissionsDetailAsync(int userId)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            var all = await GetAllPermissionsAsync();
            var roleCodes = IsAdminRole(user.Role)
                ? all.Select(p => p.Code).ToHashSet(StringComparer.OrdinalIgnoreCase)
                : (await GetRolePermissionCodesAsync(user.Role)).ToHashSet(StringComparer.OrdinalIgnoreCase);

            var overrides = await _context.UserPermissions
                .Where(up => up.UserId == userId)
                .Select(up => new { up.Permission.Code, up.IsGranted })
                .ToListAsync();

            var overrideMap = overrides.ToDictionary(o => o.Code, o => o.IsGranted, StringComparer.OrdinalIgnoreCase);
            var effective = await GetEffectivePermissionsAsync(userId);

            return new
            {
                userId = user.Id,
                username = user.Username,
                role = user.Role,
                isAdmin = IsAdminRole(user.Role),
                permissions = all.Select(p =>
                {
                    overrideMap.TryGetValue(p.Code, out var granted);
                    var hasOverride = overrideMap.ContainsKey(p.Code);
                    return new
                    {
                        p.Code,
                        p.Name,
                        p.Group,
                        p.Description,
                        fromRole = roleCodes.Contains(p.Code),
                        hasOverride,
                        overrideGranted = hasOverride ? (bool?)granted : null,
                        effective = effective.Contains(p.Code)
                    };
                }).ToList()
            };
        }
    }

    public class UserPermissionItem
    {
        public string Code { get; set; }
        public bool IsGranted { get; set; } = true;
    }
}
