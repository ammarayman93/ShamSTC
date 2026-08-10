using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Services;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using System;
using System.Threading.Tasks;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/purchases")]
    [Authorize]
    public class PurchasesController : ControllerBase
    {
        private readonly PurchaseService _service;

        public PurchasesController(PurchaseService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var result = await _service.GetAll(page, pageSize);
            return Ok(ApiResponse<object>.Ok(result));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Employee")]
        public async Task<IActionResult> Create([FromBody] CreatePurchaseDto dto)
        {
            try
            {
                var purchase = await _service.Create(dto);
                return Ok(ApiResponse<object>.Ok(purchase, "تم تسجيل عملية الشراء بنجاح"));
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
                var result = await _service.Delete(id);
                if (!result)
                    return NotFound(ApiResponse<string>.Fail("عملية الشراء غير موجودة"));

                return Ok(ApiResponse<string>.Ok("تم حذف عملية الشراء وتعديل المخزون بنجاح"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
