using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentService _service;

        public PaymentsController(PaymentService service)
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

        /// <summary>تسجيل دفعة / تحصيل اشتراك → صندوق التفعيلات (+ فاتورة مرتبطة)</summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Employee,Support")]
        public async Task<IActionResult> Pay([FromBody] CreatePaymentDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات الدفع المرسلة غير صالحة"));

            try
            {
                if (dto.ClientId <= 0)
                    return BadRequest(ApiResponse<string>.Fail("يجب تحديد ClientId"));

                var payment = await _service.Pay(
                    dto.ClientId,
                    dto.Amount,
                    dto.CashBoxId,
                    dto.Notes,
                    UserId,
                    dto.InvoiceId,
                    extendSubscription: true);

                return Ok(ApiResponse<object>.Ok(payment, "تم تسجيل الدفعة في صندوق التفعيلات"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var payments = await _service.GetAll();
                return Ok(ApiResponse<object>.Ok(payments));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
