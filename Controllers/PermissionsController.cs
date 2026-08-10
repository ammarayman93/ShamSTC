using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ISPSystem.Helpers;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/permissions")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly PermissionService _permissions;

        public PermissionsController(PermissionService permissions)
        {
            _permissions = permissions;
        }

        private int? CurrentUserId
        {
            get
            {
                var v = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(v, out var id) ? id : null;
            }
        }

        /// <summary>قائمة كل الصلاحيات المعرّفة في النظام</summary>
        [HttpGet]
        [HasPermission("users.manage", "users.view")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _permissions.GetAllPermissionsAsync();
            var grouped = list
                .GroupBy(p => p.Group)
                .Select(g => new
                {
                    group = g.Key,
                    permissions = g.Select(p => new
                    {
                        p.Id,
                        p.Code,
                        p.Name,
                        p.Description,
                        p.SortOrder
                    })
                });
            return Ok(ApiResponse<object>.Ok(grouped));
        }

        /// <summary>صلاحياتي الحالية (بعد تسجيل الدخول)</summary>
        [HttpGet("me")]
        public async Task<IActionResult> MyPermissions()
        {
            if (!CurrentUserId.HasValue)
                return Unauthorized(ApiResponse<string>.Fail("غير مصرح"));

            var role = User.FindFirstValue(ClaimTypes.Role);
            var codes = await _permissions.GetEffectivePermissionsAsync(CurrentUserId.Value);
            return Ok(ApiResponse<object>.Ok(new
            {
                role,
                isAdmin = PermissionService.IsAdminRole(role),
                permissions = codes.OrderBy(c => c).ToList()
            }));
        }

        /// <summary>تفاصيل صلاحيات مستخدم (دور + تخصيصات + الفعلي)</summary>
        [HttpGet("user/{userId}")]
        [HasPermission("users.manage")]
        public async Task<IActionResult> GetUserPermissions(int userId)
        {
            var detail = await _permissions.GetUserPermissionsDetailAsync(userId);
            if (detail == null)
                return NotFound(ApiResponse<string>.Fail("المستخدم غير موجود"));
            return Ok(ApiResponse<object>.Ok(detail));
        }

        /// <summary>تعيين تخصيصات صلاحيات لمستخدم</summary>
        [HttpPut("user/{userId}")]
        [HasPermission("users.manage")]
        public async Task<IActionResult> SetUserPermissions(int userId, [FromBody] SetUserPermissionsDto dto)
        {
            try
            {
                var items = (dto?.Permissions ?? new List<UserPermissionItemDto>())
                    .Select(p => new UserPermissionItem
                    {
                        Code = p.Code,
                        IsGranted = p.IsGranted
                    });

                await _permissions.SetUserPermissionsAsync(userId, items);
                var detail = await _permissions.GetUserPermissionsDetailAsync(userId);
                return Ok(ApiResponse<object>.Ok(detail, "تم تحديث صلاحيات المستخدم"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        /// <summary>صلاحيات دور (قالب)</summary>
        [HttpGet("roles/{role}")]
        [HasPermission("users.manage", "users.view")]
        public async Task<IActionResult> GetRolePermissions(string role)
        {
            var codes = await _permissions.GetRolePermissionCodesAsync(role);
            return Ok(ApiResponse<object>.Ok(new { role, permissions = codes }));
        }
    }

    public class SetUserPermissionsDto
    {
        public List<UserPermissionItemDto> Permissions { get; set; }
    }

    public class UserPermissionItemDto
    {
        public string Code { get; set; }
        public bool IsGranted { get; set; } = true;
    }
}
