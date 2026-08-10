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
    [Route("api/sales")]
    [Authorize]
    public class SalesController : ControllerBase
    {
        private readonly SaleService _service;

        public SalesController(SaleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _service.GetAll(page, pageSize);
            return Ok(ApiResponse<object>.Ok(result));
        }

        [HttpPost("sell")]
        [Authorize(Roles = "Admin,Accountant,SalesPerson,Employee")]
        public async Task<IActionResult> Sell([FromBody] CreateSaleDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات طلب البيع غير صالحة"));

            try
            {
                var sale = await _service.Sell(dto);
                return Ok(ApiResponse<object>.Ok(sale, "تم تسجيل عملية البيع بنجاح"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}