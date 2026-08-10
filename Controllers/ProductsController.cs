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
    [Route("api/products")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _service;

        public ProductsController(ProductService service)
        {
            _service = service;
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
            var product = await _service.GetById(id);
            if (product == null)
                return NotFound(ApiResponse<string>.Fail("«·„‰ Ã €Ì— „ÊÃÊœ"));

            return Ok(ApiResponse<object>.Ok(product));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Employee")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            try
            {
                var product = await _service.Create(dto);
                return Ok(ApiResponse<object>.Ok(product, " „ ≈÷«›… «·„‰ Ã »‰Ã«Õ"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            try
            {
                var product = await _service.Update(id, dto);
                return Ok(ApiResponse<object>.Ok(product, " „  ÕœÌÀ «·„‰ Ã »‰Ã«Õ"));
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
            var result = await _service.Delete(id);
            if (!result)
                return NotFound(ApiResponse<string>.Fail("«·„‰ Ã €Ì— „ÊÃÊœ"));

            return Ok(ApiResponse<string>.Ok(" „ Õ–›/ ⁄ÿÌ· «·„‰ Ã »‰Ã«Õ"));
        }
    }
}