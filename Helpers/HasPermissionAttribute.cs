using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ISPSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace ISPSystem.Helpers
{
    /// <summary>
    /// يتطلب صلاحية واحدة أو أكثر (OR).
    /// Admin يتجاوز الفحص دائماً.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class HasPermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _codes;

        public HasPermissionAttribute(params string[] codes)
        {
            _codes = codes ?? Array.Empty<string>();
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // عملاء البوابة ليسوا موظفين
            var type = user.FindFirst("Type")?.Value;
            if (string.Equals(type, "client", StringComparison.OrdinalIgnoreCase))
            {
                context.Result = new ForbidResult();
                return;
            }

            var role = user.FindFirst(ClaimTypes.Role)?.Value;
            if (PermissionService.IsAdminRole(role))
                return;

            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var userId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var permService = context.HttpContext.RequestServices.GetRequiredService<PermissionService>();
            var ok = await permService.HasAnyAsync(userId, _codes);
            if (!ok)
            {
                context.Result = new ObjectResult(new
                {
                    success = false,
                    message = "ليس لديك صلاحية لتنفيذ هذا الإجراء",
                    required = _codes
                })
                {
                    StatusCode = 403
                };
            }
        }
    }
}
