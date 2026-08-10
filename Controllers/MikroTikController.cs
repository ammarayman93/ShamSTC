using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Services;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/mikrotik")]
    [Authorize] // 🔐 الكنترولر بالكامل يتطلب تسجيل الدخول
    public class MikroTikController : ControllerBase
    {
        private readonly MikroTikService _mikroTik;

        public MikroTikController(MikroTikService mikroTik)
        {
            _mikroTik = mikroTik;
        }

        // 🟢 جلب المستخدمين النشطين (Active Connections) حاليًا على سيرفر ميكروتيك
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveUsers()
        {
            try
            {
                var users = await _mikroTik.GetActiveUsers();

                // 🛠️ تم الإصلاح: استخدام اسم الكلاس الصحيح ActiveUser بدلاً من المتغير users
                var result = users ?? new List<ActiveUser>();

                return Ok(ApiResponse<object>.Ok(new { list = result, count = result.Count }));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail($"فشل جلب اتصالات ميكروتيك: {ex.Message}"));
            }
        }

        // 📋 جلب كافة مستخدمي الـ PPPoE المسجلين في السيرفر
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _mikroTik.GetAllPppUsers();
                return Ok(ApiResponse<object>.Ok(users));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🚫 تعطيل حساب مستخدم (إيقاف مؤقت للاشتراك)
        [HttpPost("disable/{username}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> DisableUser(string username)
        {
            var result = await _mikroTik.DisablePppUser(username);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم تعطيل حساب المستخدم {username} بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل تعطيل حساب المستخدم {username}"));
        }

        // ▶️ تمكين وتفعيل حساب مستخدم معطل
        [HttpPost("enable/{username}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> EnableUser(string username)
        {
            var result = await _mikroTik.EnablePppUser(username);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم تفعيل حساب المستخدم {username} بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل تفعيل حساب المستخدم {username}"));
        }

        // ❌ حذف حساب مستخدم نهائيًا من الراوتر
        [HttpDelete("user/{username}")]
        [Authorize(Roles = "Admin")] // الحذف متاح للمسؤول المباشر فقط
        public async Task<IActionResult> DeleteUser(string username)
        {
            var result = await _mikroTik.RemovePppUser(username);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم حذف المستخدم {username} من السيرفر بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل حذف المستخدم {username}"));
        }

        // ➕ إضافة مستخدم PPPoE جديد لروتر برودباند
        [HttpPost("user")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> AddUser([FromBody] AddUserRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username))
                return BadRequest(ApiResponse<string>.Fail("بيانات طلب إضافة مستخدم غير صالحة"));

            var result = await _mikroTik.AddPppUser(request.Username, request.Password, request.Profile, request.Comment);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إنشاء حساب المستخدم {request.Username} بنجاح"));

            return BadRequest(ApiResponse<string>.Fail("فشل إنشاء حساب المستخدم، قد يكون الاسم مكررًا بالسيرفر"));
        }

        // ⚡ تعديل سرعة اشتراك المستخدم (تغيير الـ Profile)
        [HttpPut("user/{username}/speed")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> UpdateUserSpeed(string username, [FromBody] UpdateSpeedRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Profile))
                return BadRequest(ApiResponse<string>.Fail("البروفايل المختار غير صالح"));

            var result = await _mikroTik.UpdateUserSpeed(username, request.Profile);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم تحديث سرعة الحساب {username} إلى {request.Profile}"));

            return BadRequest(ApiResponse<string>.Fail($"فشل تحديث سرعة الحساب {username}"));
        }

        // 🧱 حظر عنوان IP محدد يدويًا (بإضافته إلى الـ Address List أو الـ Firewall)
        [HttpPost("block/{address}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> BlockAddress(string address, [FromQuery] string comment = "Blocked by ISP System")
        {
            var result = await _mikroTik.BlockUserByAddress(address, comment);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إدراج العنوان {address} في قائمة الحظر بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل حظر العنوان {address}"));
        }

        // 🔓 إلغاء حظر عنوان IP وإزالته من قائمة الجدار الناري
        [HttpDelete("block/{address}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> UnblockAddress(string address)
        {
            var result = await _mikroTik.UnblockUserByAddress(address);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إلغاء حظر العنوان {address} وسماح المرور له"));

            return BadRequest(ApiResponse<string>.Fail($"فشل إلغاء حظر العنوان {address}"));
        }

        // 🚀 إضافة Profile سرعة مخصص جديد للتحكم بالباندويث (Rate-Limit)
        [HttpPost("profile")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProfile([FromBody] AddProfileRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Name))
                return BadRequest(ApiResponse<string>.Fail("بيانات البروفايل غير مكتملة"));

            var result = await _mikroTik.AddProfile(request.Name, request.RateLimit, request.ParentQueue);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إنشاء بروفايل السرعة {request.Name} بنجاح على ميكروتيك"));

            return BadRequest(ApiResponse<string>.Fail($"فشل إنشاء بروفايل السرعة {request.Name}"));
        }
    }

    // 🗂️ نماذج البيانات الممررة عبر الـ Body Requests
    public class AddUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Profile { get; set; }
        public string Comment { get; set; }
    }

    public class UpdateSpeedRequest
    {
        public string Profile { get; set; }
    }

    public class AddProfileRequest
    {
        public string Name { get; set; }
        public string RateLimit { get; set; } // مثال: 10M/10M
        public string ParentQueue { get; set; } = "none";
    }
}