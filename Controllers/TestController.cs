using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Services;
using ISPSystem.Helpers;
using System;
using System.Threading.Tasks;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/test")]
    [Authorize(Roles = "Admin")] // 🔐 حماية كاملة للـ Controller لمنع كشف حالة السيرفرات لأي مستخدم عادي
    public class TestController : ControllerBase
    {
        private readonly RadiusService _radius;
        private readonly MikroTikService _mikroTik;

        public TestController(RadiusService radius, MikroTikService mikroTik)
        {
            _radius = radius;
            _mikroTik = mikroTik;
        }

        // 📡 اختبار الاتصال بـ RADIUS Server
        [HttpGet("radius-connection")]
        public async Task<IActionResult> TestRadiusConnection()
        {
            string testUsername = $"test_user_{Guid.NewGuid().ToString().Substring(0, 8)}";
            try
            {
                // محاولة إنشاء مستخدم تجريبي فريد لفحص صلاحية الكتابة
                bool isCreated = await _radius.CreateUser(testUsername, "test_pass_123", "4M");

                if (isCreated)
                {
                    // 🔄 تنظيف تلقائي: إزالة مستخدم الفحص فوراً لمنع تراكم السجلات الوهمية
                    try { await _radius.DeleteUser(testUsername); } catch { /* تجاهل أخطاء الحذف الفرعية لحماية الفحص الأساسي */ }

                    return Ok(ApiResponse<string>.Ok("اتصال خادم RADIUS مستقر ويعمل بشكل صحيح."));
                }

                return BadRequest(ApiResponse<string>.Fail("فشل الاتصال بخادم RADIUS. تحقق من الإعدادات وصلاحيات الوصول."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail($"خطأ أثناء فحص خادم RADIUS: {ex.Message}"));
            }
        }

        // 🌐 اختبار الاتصال بـ MikroTik Router (API / WinBox Port)
        [HttpGet("mikrotik-connection")]
        public async Task<IActionResult> TestMikroTikConnection()
        {
            try
            {
                var users = await _mikroTik.GetAllPppUsers();
                var count = users?.Count ?? 0;

                return Ok(ApiResponse<object>.Ok(new
                {
                    Message = $"تم الاتصال بـ MikroTik بنجاح! تم العثور على {count} مستخدم active/configured.",
                    UserCount = count
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail($"فشل الاتصال بالراوتر: {ex.Message}"));
            }
        }

        // 🔄 اختبار شامل مجمع لكافة مكونات البنية التحتية للـ ISP
        [HttpGet("full-test")]
        public async Task<IActionResult> FullTest()
        {
            var results = new
            {
                MikroTik = await TestMikroTikConnectionInternal(),
                Radius = await TestRadiusConnectionInternal()
            };

            return Ok(ApiResponse<object>.Ok(results));
        }

        // --- الميثودز الداخلية المساعدة لمزامنة الفحص الكامل ---

        private async Task<object> TestMikroTikConnectionInternal()
        {
            try
            {
                var users = await _mikroTik.GetAllPppUsers();
                return new { Connected = true, Message = $"Connected, {users?.Count ?? 0} users found." };
            }
            catch (Exception ex)
            {
                return new { Connected = false, Message = ex.Message };
            }
        }

        private async Task<object> TestRadiusConnectionInternal()
        {
            string testUsername = $"test_dummy_{Guid.NewGuid().ToString().Substring(0, 8)}";
            try
            {
                bool isCreated = await _radius.CreateUser(testUsername, "test", "1M");
                if (isCreated)
                {
                    try { await _radius.DeleteUser(testUsername); } catch { }
                    return new { Connected = true, Message = "RADIUS connection successful." };
                }
                return new { Connected = false, Message = "Failed to communicate with RADIUS database." };
            }
            catch (Exception ex)
            {
                return new { Connected = false, Message = ex.Message };
            }
        }
    }
}