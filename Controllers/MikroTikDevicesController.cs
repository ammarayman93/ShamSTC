using System;
using System.Threading.Tasks;
using ISPSystem.Helpers;
using ISPSystem.Models;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/mikrotik-devices")]
    [Authorize]
    public class MikroTikDevicesController : ControllerBase
    {
        private readonly MikroTikDeviceService _service;

        public MikroTikDevicesController(MikroTikDeviceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var devices = await _service.GetAll();
            return Ok(ApiResponse<object>.Ok(devices));
        }

        /// <summary>لوحة الفروع: تجميع حسب Region</summary>
        [HttpGet("by-region")]
        public async Task<IActionResult> GetByRegion()
        {
            var data = await _service.GetGroupedByRegion();
            return Ok(ApiResponse<object>.Ok(data));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var device = await _service.GetById(id);
            if (device == null)
                return NotFound(ApiResponse<string>.Fail("الجهاز غير موجود"));
            return Ok(ApiResponse<object>.Ok(device));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] MikroTikDevice device)
        {
            if (string.IsNullOrWhiteSpace(device.Name))
                return BadRequest(ApiResponse<string>.Fail("الاسم مطلوب"));
            if (string.IsNullOrWhiteSpace(device.IpAddress) && string.IsNullOrWhiteSpace(device.VpnIp))
                return BadRequest(ApiResponse<string>.Fail("عنوان IP أو VpnIp مطلوب"));

            var result = await _service.Create(device);
            return Ok(ApiResponse<object>.Ok(result, "تم إضافة السيرفر بنجاح"));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] MikroTikDevice dto)
        {
            var result = await _service.Update(id, dto);
            if (result == null)
                return NotFound(ApiResponse<string>.Fail("الجهاز غير موجود"));
            return Ok(ApiResponse<object>.Ok(result, "تم التحديث"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.Delete(id);
                if (!result)
                    return NotFound(ApiResponse<string>.Fail("الجهاز غير موجود"));
                return Ok(ApiResponse<string>.Ok(null, "تم الحذف بنجاح"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("{id}/check")]
        public async Task<IActionResult> CheckConnection(int id)
        {
            var device = await _service.CheckConnection(id);
            if (device == null)
                return NotFound(ApiResponse<string>.Fail("الجهاز غير موجود"));

            return Ok(ApiResponse<object>.Ok(new
            {
                device.Id,
                device.Name,
                device.Region,
                device.IsOnline,
                device.Status,
                device.LastCheckedAt,
                device.LastError
            }));
        }

        [HttpPost("check-all")]
        public async Task<IActionResult> CheckAll()
        {
            var devices = await _service.CheckAllConnections();
            return Ok(ApiResponse<object>.Ok(devices));
        }
    }
}
