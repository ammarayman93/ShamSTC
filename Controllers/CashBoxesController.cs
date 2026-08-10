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
    [Route("api/cash-boxes")]
    [Authorize]
    public class CashBoxesController : ControllerBase
    {
        private readonly CashBoxService _service;

        public CashBoxesController(CashBoxService service)
        {
            _service = service;
        }

        private int? CurrentUserId
        {
            get
            {
                var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(id, out var n) ? n : null;
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAll();
            return Ok(ApiResponse<object>.Ok(list));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var box = await _service.GetById(id);
            if (box == null)
                return NotFound(ApiResponse<string>.Fail("الصندوق غير موجود"));
            return Ok(ApiResponse<object>.Ok(box));
        }

        [HttpGet("{id}/transactions")]
        public async Task<IActionResult> GetTransactions(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var list = await _service.GetTransactions(id, page, pageSize);
            return Ok(ApiResponse<object>.Ok(list));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Create([FromBody] CreateCashBoxDto dto)
        {
            try
            {
                var box = await _service.Create(dto);
                return Ok(ApiResponse<object>.Ok(box, "تم إنشاء الصندوق"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCashBoxDto dto)
        {
            var box = await _service.Update(id, dto);
            if (box == null)
                return NotFound(ApiResponse<string>.Fail("الصندوق غير موجود"));
            return Ok(ApiResponse<object>.Ok(box, "تم التحديث"));
        }

        /// <summary>حركة يدوية وارد/صادر</summary>
        [HttpPost("movement")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> ManualMovement([FromBody] ManualCashMovementDto dto)
        {
            try
            {
                var trx = await _service.ManualMovement(dto, CurrentUserId);
                return Ok(ApiResponse<object>.Ok(trx, "تمت الحركة"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        /// <summary>تحويل بين صندوقين</summary>
        [HttpPost("transfer")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Transfer([FromBody] CashBoxTransferDto dto)
        {
            try
            {
                await _service.Transfer(dto, CurrentUserId);
                return Ok(ApiResponse<string>.Ok("تم التحويل بنجاح"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
