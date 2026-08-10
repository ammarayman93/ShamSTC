using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Models;
using ISPSystem.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/invoices")]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly InvoiceService _invoiceService;
        private readonly PdfService _pdfService;
        private readonly AppDbContext _context;

        public InvoicesController(InvoiceService invoiceService, PdfService pdfService, AppDbContext context)
        {
            _invoiceService = invoiceService;
            _pdfService = pdfService;
            _context = context;
        }

        private int? UserId
        {
            get
            {
                var v = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(v, out var id) ? id : null;
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            var invoice = await _invoiceService.GetById(id);
            if (invoice == null)
                return NotFound(ApiResponse<string>.Fail("الفاتورة المطلوبة غير موجودة"));

            // تفاصيل الصندوق عبر الدفعات
            var payments = await _context.Payments
                .Include(p => p.CashBox)
                .Where(p => p.InvoiceId == id)
                .Select(p => new
                {
                    p.Id,
                    p.Amount,
                    p.Date,
                    p.CashBoxId,
                    CashBoxName = p.CashBox != null ? p.CashBox.Name : null,
                    CashBoxCode = p.CashBox != null ? p.CashBox.Code : null
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                invoice,
                payments,
                defaultCashBox = "صندوق التفعيلات (ACT)"
            }));
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetInvoicePdf(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Subscription)
                    .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound(ApiResponse<string>.Fail("الفاتورة المطلوبة غير موجودة"));

            if (invoice.Client == null || invoice.Subscription == null || invoice.Subscription.Plan == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات الفاتورة أو العميل المرتبط بها غير مكتملة في النظام"));

            var pdf = _pdfService.GenerateInvoicePdf(invoice, invoice.Client, invoice.Subscription, invoice.Subscription.Plan);
            return File(pdf, "application/pdf", $"Invoice_{invoice.InvoiceNumber}.pdf");
        }

        /// <summary>
        /// قائمة فواتير الاشتراك مع ربط صندوق التفعيلات
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Accountant,Support")]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _invoiceService.GetAllDetailed();
            return Ok(ApiResponse<object>.Ok(invoices));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات الفاتورة غير صالحة"));

            var invoice = await _invoiceService.Create(dto);
            return Ok(ApiResponse<Invoice>.Ok(invoice));
        }

        /// <summary>
        /// سداد فاتورة اشتراك → صندوق التفعيلات
        /// </summary>
        [HttpPut("{id}/pay")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            try
            {
                var result = await _invoiceService.MarkAsPaid(id, UserId);
                return Ok(ApiResponse<object>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("client")]
        public async Task<IActionResult> GetClientInvoices()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int clientId))
                clientId = 1;

            var invoices = await _context.Invoices
                .Where(i => i.ClientId == clientId)
                .OrderByDescending(i => i.Date)
                .ToListAsync();

            return Ok(ApiResponse<List<Invoice>>.Ok(invoices));
        }
    }
}
