using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Services;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/mikrotik")]
    [Authorize]
    public class MikroTikController : ControllerBase
    {
        private readonly MikroTikService _mikroTik;

        public MikroTikController(MikroTikService mikroTik)
        {
            _mikroTik = mikroTik;
        }

        /// <summary>
        /// جلب المستخدمين النشطين.
        /// deviceId اختياري: إن لم يُمرَّر يُستخدم الجهاز الافتراضي.
        /// all=true يجلب من كل الأجهزة المسجّلة.
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveUsers([FromQuery] int? deviceId = null, [FromQuery] bool all = false)
        {
            try
            {
                if (all)
                {
                    var results = await _mikroTik.GetActiveUsersAllDevices();
                    var payload = results.Select(r => new
                    {
                        deviceId = r.Device?.Id,
                        deviceName = r.Device?.Name ?? "default",
                        region = r.Device?.Region,
                        count = r.Users.Count,
                        error = r.Error,
                        list = r.Users
                    }).ToList();
                    var total = results.Sum(r => r.Users.Count);
                    return Ok(ApiResponse<object>.Ok(new { servers = payload, totalCount = total }));
                }

                if (deviceId.HasValue && deviceId.Value > 0)
                {
                    var users = await _mikroTik.GetActiveUsersByDeviceId(deviceId.Value);
                    var result = users ?? new List<ActiveUser>();
                    return Ok(ApiResponse<object>.Ok(new { list = result, count = result.Count, deviceId }));
                }

                {
                    var users = await _mikroTik.GetActiveUsers();
                    var result = users ?? new List<ActiveUser>();
                    return Ok(ApiResponse<object>.Ok(new { list = result, count = result.Count }));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail($"فشل جلب اتصالات ميكروتيك: {ex.Message}"));
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int? deviceId = null)
        {
            try
            {
                var users = deviceId.HasValue && deviceId.Value > 0
                    ? await _mikroTik.GetAllPppUsersByDeviceId(deviceId.Value)
                    : await _mikroTik.GetAllPppUsers();
                return Ok(ApiResponse<object>.Ok(users));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("disable/{username}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> DisableUser(string username, [FromQuery] int? deviceId = null)
        {
            bool result;
            if (deviceId.HasValue && deviceId.Value > 0)
                result = await _mikroTik.DisablePppUserByDeviceId(username, deviceId.Value);
            else
                result = await _mikroTik.DisablePppUser(username);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم تعطيل حساب المستخدم {username} بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل تعطيل حساب المستخدم {username}"));
        }

        [HttpPost("enable/{username}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> EnableUser(string username, [FromQuery] int? deviceId = null)
        {
            bool result;
            if (deviceId.HasValue && deviceId.Value > 0)
                result = await _mikroTik.EnablePppUserByDeviceId(username, deviceId.Value);
            else
                result = await _mikroTik.EnablePppUser(username);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم تفعيل حساب المستخدم {username} بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل تفعيل حساب المستخدم {username}"));
        }

        [HttpDelete("user/{username}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string username, [FromQuery] int? deviceId = null)
        {
            bool result;
            if (deviceId.HasValue && deviceId.Value > 0)
                result = await _mikroTik.RemovePppUserByDeviceId(username, deviceId.Value);
            else
                result = await _mikroTik.RemovePppUser(username);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم حذف المستخدم {username} من السيرفر بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل حذف المستخدم {username}"));
        }

        [HttpPost("user")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> AddUser([FromBody] AddUserRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username))
                return BadRequest(ApiResponse<string>.Fail("بيانات طلب إضافة مستخدم غير صالحة"));

            bool result;
            if (request.DeviceId.HasValue && request.DeviceId.Value > 0)
                result = await _mikroTik.AddPppUserByDeviceId(
                    request.Username, request.Password, request.Profile, request.Comment ?? "", request.DeviceId.Value);
            else
                result = await _mikroTik.AddPppUser(request.Username, request.Password, request.Profile, request.Comment);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إنشاء حساب المستخدم {request.Username} بنجاح"));

            return BadRequest(ApiResponse<string>.Fail("فشل إنشاء حساب المستخدم، قد يكون الاسم مكررًا بالسيرفر"));
        }

        [HttpPut("user/{username}/speed")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> UpdateUserSpeed(string username, [FromBody] UpdateSpeedRequest request, [FromQuery] int? deviceId = null)
        {
            if (request == null || string.IsNullOrEmpty(request.Profile))
                return BadRequest(ApiResponse<string>.Fail("البروفايل المختار غير صالح"));

            var id = deviceId ?? request.DeviceId;
            bool result;
            if (id.HasValue && id.Value > 0)
                result = await _mikroTik.UpdateUserSpeedByDeviceId(username, request.Profile, id.Value);
            else
                result = await _mikroTik.UpdateUserSpeed(username, request.Profile);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم تحديث سرعة الحساب {username} إلى {request.Profile}"));

            return BadRequest(ApiResponse<string>.Fail($"فشل تحديث سرعة الحساب {username}"));
        }

        [HttpPost("block/{address}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> BlockAddress(string address, [FromQuery] string comment = "Blocked by ISP System", [FromQuery] int? deviceId = null)
        {
            ISPSystem.Models.MikroTikDevice device = null;
            if (deviceId.HasValue && deviceId.Value > 0)
                device = await _mikroTik.GetDeviceAsync(deviceId.Value);

            var result = await _mikroTik.BlockUserByAddress(address, comment, device);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إدراج العنوان {address} في قائمة الحظر بنجاح"));

            return BadRequest(ApiResponse<string>.Fail($"فشل حظر العنوان {address}"));
        }

        [HttpDelete("block/{address}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> UnblockAddress(string address, [FromQuery] int? deviceId = null)
        {
            ISPSystem.Models.MikroTikDevice device = null;
            if (deviceId.HasValue && deviceId.Value > 0)
                device = await _mikroTik.GetDeviceAsync(deviceId.Value);

            var result = await _mikroTik.UnblockUserByAddress(address, device);
            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إلغاء حظر العنوان {address} وسماح المرور له"));

            return BadRequest(ApiResponse<string>.Fail($"فشل إلغاء حظر العنوان {address}"));
        }

        [HttpPost("profile")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProfile([FromBody] AddProfileRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Name))
                return BadRequest(ApiResponse<string>.Fail("بيانات البروفايل غير مكتملة"));

            bool result;
            if (request.DeviceId.HasValue && request.DeviceId.Value > 0)
                result = await _mikroTik.AddProfileByDeviceId(request.Name, request.RateLimit, request.DeviceId.Value, request.ParentQueue);
            else
                result = await _mikroTik.AddProfile(request.Name, request.RateLimit, request.ParentQueue);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم إنشاء بروفايل السرعة {request.Name} بنجاح على ميكروتيك"));

            return BadRequest(ApiResponse<string>.Fail($"فشل إنشاء بروفايل السرعة {request.Name}"));
        }

        /// <summary>فصل جلسة نشطة (Kick)</summary>
        [HttpPost("kick/{username}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> KickUser(string username, [FromQuery] int? deviceId = null)
        {
            bool result;
            if (deviceId.HasValue && deviceId.Value > 0)
                result = await _mikroTik.KickActiveUserByDeviceId(username, deviceId.Value);
            else
                result = await _mikroTik.KickActiveUser(username);

            if (result)
                return Ok(ApiResponse<string>.Ok($"تم فصل الجلسة {username}"));
            return BadRequest(ApiResponse<string>.Fail($"فشل فصل الجلسة {username}"));
        }
    }

    public class AddUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Profile { get; set; }
        public string Comment { get; set; }
        /// <summary>معرّف جهاز MikroTik (من جدول MikroTikDevices)</summary>
        public int? DeviceId { get; set; }
    }

    public class UpdateSpeedRequest
    {
        public string Profile { get; set; }
        public int? DeviceId { get; set; }
    }

    public class AddProfileRequest
    {
        public string Name { get; set; }
        public string RateLimit { get; set; }
        public string ParentQueue { get; set; } = "none";
        public int? DeviceId { get; set; }
    }
}
