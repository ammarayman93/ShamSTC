using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/sales-invoices")]
    [Authorize]
    public class SalesInvoicesController : ControllerBase
    {
        private readonly SalesInvoiceService _service;

        public SalesInvoicesController(SalesInvoiceService service)
        {
            _service = service;
        }

        private int? UserId
        {
            get
            {
                var v = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(v, out var id) ? id : null;
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _service.GetAll(search, page, pageSize);
            return Ok(ApiResponse<object>.Ok(result));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var inv = await _service.GetById(id);
            if (inv == null)
                return NotFound(ApiResponse<string>.Fail("الفاتورة غير موجودة"));
            return Ok(ApiResponse<object>.Ok(inv));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Employee")]
        public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto)
        {
            try
            {
                var inv = await _service.Create(dto, UserId);
                return Ok(ApiResponse<object>.Ok(inv, "تم حفظ فاتورة المبيعات"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _service.Delete(id);
                if (!ok)
                    return NotFound(ApiResponse<string>.Fail("الفاتورة غير موجودة"));
                return Ok(ApiResponse<string>.Ok("تم الحذف"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
