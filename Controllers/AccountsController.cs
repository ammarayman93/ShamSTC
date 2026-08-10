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
    [Route("api/accounts")]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly AccountService _service;

        public AccountsController(AccountService service)
        {
            _service = service;
        }

        /// <summary>شجرة الحسابات الكاملة</summary>
        [HttpGet("tree")]
        public async Task<IActionResult> GetTree()
        {
            var tree = await _service.GetTree();
            return Ok(ApiResponse<object>.Ok(tree));
        }

        /// <summary>قائمة مسطحة</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllFlat();
            return Ok(ApiResponse<object>.Ok(list));
        }

        /// <summary>حسابات قابلة للتقييد (للقوائم المنسدلة)</summary>
        [HttpGet("postable")]
        public async Task<IActionResult> GetPostable([FromQuery] string type = null)
        {
            var list = await _service.GetPostable(type);
            return Ok(ApiResponse<object>.Ok(list));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var account = await _service.GetById(id);
            if (account == null)
                return NotFound(ApiResponse<string>.Fail("الحساب غير موجود"));
            return Ok(ApiResponse<object>.Ok(account));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Create([FromBody] CreateAccountDto dto)
        {
            try
            {
                var account = await _service.Create(dto);
                return Ok(ApiResponse<object>.Ok(account, "تم إنشاء الحساب"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAccountDto dto)
        {
            var account = await _service.Update(id, dto);
            if (account == null)
                return NotFound(ApiResponse<string>.Fail("الحساب غير موجود"));
            return Ok(ApiResponse<object>.Ok(account, "تم التحديث"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _service.Delete(id);
                if (!ok)
                    return NotFound(ApiResponse<string>.Fail("الحساب غير موجود"));
                return Ok(ApiResponse<string>.Ok("تم الحذف"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
