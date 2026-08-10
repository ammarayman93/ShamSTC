using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Models;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Services;
using ISPSystem.Data;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    [Authorize]
    public class SubscriptionsController : ControllerBase
    {
        private readonly SubscriptionService _service;
        private readonly AppDbContext _context;
        private readonly RadiusService _radius;
        private readonly MikroTikService _mikroTik;
        private readonly CashBoxService _cashBoxes;
        private readonly AuditService _audit;

        public SubscriptionsController(
            SubscriptionService service,
            AppDbContext context,
            RadiusService radius,
            MikroTikService mikroTik,
            CashBoxService cashBoxes,
            AuditService audit)
        {
            _service = service;
            _context = context;
            _radius = radius;
            _mikroTik = mikroTik;
            _cashBoxes = cashBoxes;
            _audit = audit;
        }

        /// <summary>
        /// تفعيل / تجديد اشتراك: اختيار الباقة (السرعة) + إضافة المبلغ لصندوق التفعيل
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Support,SalesPerson,Employee")]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات طلب الاشتراك غير صالحة"));

            try
            {
                var client = await _context.Clients.FindAsync(dto.UserId);
                if (client == null)
                    return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

                var plan = await _context.Plans.FindAsync(dto.PlanId);
                if (plan == null)
                    return BadRequest(ApiResponse<string>.Fail("الباقة غير موجودة"));

                // تجديد أو إنشاء مع الباقة المختارة
                var sub = await _service.Renew(dto.UserId, dto.PlanId);

                // إن طُلبت أيام مخصصة
                if (dto.Days.HasValue && dto.Days.Value > 0)
                {
                    sub.EndDate = SubscriptionService.EndAtNoon(DateTime.Now, dto.Days.Value);
                    await _context.SaveChangesAsync();
                }

                // RADIUS
                await _radius.UpdateExpiration(client.Username, sub.EndDate);
                await _radius.EnableUser(client.Username);
                if (!string.IsNullOrWhiteSpace(plan.Speed))
                    await _radius.UpdateSpeed(client.Username, plan.Speed);
                try { await _mikroTik.KickActiveUser(client.Username); } catch { }

                // صندوق التفعيلات
                decimal amount = plan.Price;
                if (amount > 0)
                {
                    var invoice = new Invoice
                    {
                        InvoiceNumber = $"INV-ACT-{DateTime.Now:yyyyMMddHHmmss}-{client.Id}",
                        ClientId = client.Id,
                        SubscriptionId = sub.Id,
                        SubTotal = amount,
                        Tax = 0,
                        Discount = 0,
                        Total = amount,
                        Date = DateTime.Now,
                        DueDate = DateTime.Now,
                        IsPaid = true,
                        PaidAt = DateTime.Now,
                        Status = "Paid"
                    };
                    _context.Invoices.Add(invoice);
                    await _context.SaveChangesAsync();

                    var actBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "ACT" && c.IsActive);
                    var payment = new Payment
                    {
                        ClientId = client.Id,
                        SubscriptionId = sub.Id,
                        InvoiceId = invoice.Id,
                        Amount = amount,
                        Date = DateTime.Now,
                        PaymentMethod = "Cash",
                        Status = "Completed",
                        Notes = $"تفعيل/تجديد — {plan.Name} — {plan.Speed}",
                        CashBoxId = actBox?.Id
                    };
                    _context.Payments.Add(payment);
                    await _context.SaveChangesAsync();

                    if (actBox != null)
                    {
                        var revenueAccount = await _context.Accounts
                            .FirstOrDefaultAsync(a => a.Code == "4-1-2" && a.IsActive);
                        await _cashBoxes.PostReference(
                            actBox.Id,
                            "In",
                            amount,
                            revenueAccount?.Id ?? actBox.AccountId,
                            "Activation",
                            sub.Id,
                            $"تفعيل اشتراك — {client.FullName ?? client.Username} — {plan.Name} ({plan.Speed})",
                            null);
                    }
                }

                client.Status = "Active";
                client.PaymentStatus = amount > 0 ? "Paid" : client.PaymentStatus;
                await _context.SaveChangesAsync();
                await _audit.Log("Activate/Renew", "Subscription", sub.Id);

                return Ok(ApiResponse<object>.Ok(new
                {
                    message = "تم تفعيل/تجديد الاشتراك وإضافته لصندوق التفعيل",
                    subscription = sub,
                    newEndDate = sub.EndDate,
                    planName = plan.Name,
                    planSpeed = plan.Speed,
                    amount,
                    cashBox = "صندوق التفعيلات"
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Support,Accountant")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var subscriptions = await _service.GetAll();
                return Ok(ApiResponse<IEnumerable<Subscription>>.Ok(subscriptions));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var sub = await _service.GetById(id);
            if (sub == null)
                return NotFound(ApiResponse<string>.Fail("الاشتراك المطلوب غير موجود في النظام"));

            return Ok(ApiResponse<Subscription>.Ok(sub));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSubscriptionDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات التحديث المرسلة فارغة"));

            try
            {
                var sub = await _service.Update(id, dto);
                if (sub == null)
                    return NotFound(ApiResponse<string>.Fail("الاشتراك المطلوب غير موجود لتحديثه"));

                return Ok(ApiResponse<Subscription>.Ok(sub));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
