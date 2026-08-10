using System;
using System.Threading.Tasks;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/materials")]
    [Authorize]
    public class MaterialsController : ControllerBase
    {
        private readonly MaterialService _service;

        public MaterialsController(MaterialService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string search = null,
            [FromQuery] string category = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _service.GetAll(search, category, page, pageSize);
            return Ok(ApiResponse<object>.Ok(result));
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            var list = await _service.GetLowStock();
            return Ok(ApiResponse<object>.Ok(list));
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var list = await _service.GetCategories();
            return Ok(ApiResponse<object>.Ok(list));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null)
                return NotFound(ApiResponse<string>.Fail("المادة غير موجودة"));
            return Ok(ApiResponse<object>.Ok(item));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Employee")]
        public async Task<IActionResult> Create([FromBody] CreateMaterialDto dto)
        {
            try
            {
                var item = await _service.Create(dto);
                return Ok(ApiResponse<object>.Ok(item, "تم إنشاء بطاقة المادة"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMaterialDto dto)
        {
            try
            {
                var item = await _service.Update(id, dto);
                if (item == null)
                    return NotFound(ApiResponse<string>.Fail("المادة غير موجودة"));
                return Ok(ApiResponse<object>.Ok(item, "تم التحديث"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("{id}/adjust-stock")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> AdjustStock(int id, [FromBody] AdjustStockDto dto)
        {
            try
            {
                var item = await _service.AdjustStock(id, dto);
                if (item == null)
                    return NotFound(ApiResponse<string>.Fail("المادة غير موجودة"));
                return Ok(ApiResponse<object>.Ok(item, "تم تعديل الكمية"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.Delete(id);
            if (!ok)
                return NotFound(ApiResponse<string>.Fail("المادة غير موجودة"));
            return Ok(ApiResponse<string>.Ok("تم الحذف / التعطيل"));
        }
    }
}
