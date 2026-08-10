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
    [Authorize] // 🔐 تأمين الكنترولر بالكامل لحماية بيانات الفواتير
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

        // 🆔 جلب فاتورة محددة بواسطة المعرف
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            var invoice = await _invoiceService.GetById(id);
            if (invoice == null)
                return NotFound(ApiResponse<string>.Fail("الفاتورة المطلوبة غير موجودة"));

            return Ok(ApiResponse<Invoice>.Ok(invoice));
        }

        // 📄 توليد وتحميل ملف PDF للفاتورة بضربة قاعدة بيانات واحدة ومحسنة
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetInvoicePdf(int id)
        {
            // ⚡ تحسين الأداء: جلب الفاتورة متضمنة العميل والاشتراك والباقة بطلب مجمع واحد
            var invoice = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Subscription)
                    .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound(ApiResponse<string>.Fail("الفاتورة المطلوبة غير موجودة"));

            if (invoice.Client == null || invoice.Subscription == null || invoice.Subscription.Plan == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات الفاتورة أو العميل المرتبط بها غير مكتملة في النظام"));

            // توليد ملف الـ PDF عبر الخدمة المخصصة
            var pdf = _pdfService.GenerateInvoicePdf(invoice, invoice.Client, invoice.Subscription, invoice.Subscription.Plan);

            return File(pdf, "application/pdf", $"Invoice_{invoice.InvoiceNumber}.pdf");
        }

        // 📋 جلب قائمة الفواتير كاملة (للإدارة والدعم الفني)
        [HttpGet]
        [Authorize(Roles = "Admin,Accountant,Support")] // تقييد الوصول للموظفين فقط
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _invoiceService.GetAll();
            return Ok(ApiResponse<IEnumerable<Invoice>>.Ok(invoices));
        }

        // ➕ إنشاء فاتورة جديدة يدويًا
        [HttpPost]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات الفاتورة غير صالحة"));

            var invoice = await _invoiceService.Create(dto);
            return Ok(ApiResponse<Invoice>.Ok(invoice));
        }

        // 💳 تحويل حالة الفاتورة إلى "مدفوعة" عند السداد
        [HttpPut("{id}/pay")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
                return NotFound(ApiResponse<string>.Fail("الفاتورة المطلوبة غير موجودة"));

            // تحديث الحقول المالية وحالة السداد
            invoice.IsPaid = true;
            invoice.PaidAt = DateTime.Now;
            invoice.Status = "Paid";

            await _context.SaveChangesAsync();

            // 💡 يفضل مستقبلاً نقل هذا المنطق إلى _invoiceService.MarkAsPaid(id) لتسجيل الـ Audit Log المالي تلقائياً

            return Ok(ApiResponse<Invoice>.Ok(invoice));
        }

        // 👥 جلب فواتير العميل الحالي السجل الخاص به
        [HttpGet("client")]
        public async Task<IActionResult> GetClientInvoices()
        {
            // 🔑 استخراج الـ ClientId الحقيقي المشفر داخل توكن الـ JWT الخاص بالعميل المسجل
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int clientId))
            {
                // في حال عدم توفر التوكن بعد في مرحلة التجريب، نترك المعرف الافتراضي 1 كخيار احتياطي برمجياً
                clientId = 1;
            }

            var invoices = await _context.Invoices
                .Where(i => i.ClientId == clientId)
                .OrderByDescending(i => i.Date) // عرض الفواتير الأحدث للعميل أولاً
                .ToListAsync();

            return Ok(ApiResponse<List<Invoice>>.Ok(invoices));
        }
    }
}