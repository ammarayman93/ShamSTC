using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.Services
{
    public class InvoiceService
    {
        private readonly AppDbContext _context;
        private readonly CashBoxService _cashBoxes;

        public InvoiceService(AppDbContext context, CashBoxService cashBoxes)
        {
            _context = context;
            _cashBoxes = cashBoxes;
        }

        public async Task<Invoice> Create(CreateInvoiceDto dto)
        {
            var invoice = new Invoice
            {
                InvoiceNumber = $"INV-{DateTime.Now:yyyyMMddHHmmss}",
                ClientId = dto.ClientId,
                SubscriptionId = dto.SubscriptionId,
                Total = dto.Total,
                SubTotal = dto.Total,
                Tax = 0,
                Discount = 0,
                Date = DateTime.Now,
                DueDate = dto.DueDate,
                IsPaid = false,
                Status = "Pending"
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        /// <summary>
        /// قائمة فواتير الاشتراك مع العميل والباقة والدفعات المرتبطة بصندوق التفعيلات
        /// </summary>
        public async Task<List<object>> GetAllDetailed()
        {
            var invoices = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Subscription)
                    .ThenInclude(s => s.Plan)
                .OrderByDescending(i => i.Date)
                .ToListAsync();

            var invoiceIds = invoices.Select(i => i.Id).ToList();
            var payments = await _context.Payments
                .Include(p => p.CashBox)
                .Where(p => p.InvoiceId.HasValue && invoiceIds.Contains(p.InvoiceId.Value))
                .ToListAsync();

            var payByInvoice = payments
                .GroupBy(p => p.InvoiceId!.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            return invoices.Select(i =>
            {
                payByInvoice.TryGetValue(i.Id, out var pays);
                var primaryPay = pays?.OrderByDescending(p => p.Date).FirstOrDefault();
                return (object)new
                {
                    i.Id,
                    i.InvoiceNumber,
                    i.ClientId,
                    ClientName = i.Client?.FullName,
                    ClientUsername = i.Client?.Username,
                    i.SubscriptionId,
                    PlanName = i.Subscription?.Plan?.Name,
                    PlanSpeed = i.Subscription?.Plan?.Speed,
                    i.SubTotal,
                    i.Tax,
                    i.Discount,
                    i.Total,
                    i.Date,
                    i.DueDate,
                    i.IsPaid,
                    i.PaidAt,
                    i.Status,
                    i.Notes,
                    IsOverdue = !i.IsPaid && i.DueDate < DateTime.Now,
                    // ربط صندوق التفعيلات عبر الدفعة
                    CashBoxId = primaryPay?.CashBoxId,
                    CashBoxName = primaryPay?.CashBox?.Name ?? (i.IsPaid ? null : "صندوق التفعيلات (عند السداد)"),
                    CashBoxCode = primaryPay?.CashBox?.Code,
                    PaymentId = primaryPay?.Id,
                    PaymentsCount = pays?.Count ?? 0,
                    PaidAmount = pays?.Sum(p => p.Amount) ?? 0
                };
            }).ToList();
        }

        public async Task<List<Invoice>> GetAll()
        {
            return await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Subscription)
                    .ThenInclude(s => s.Plan)
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }

        public async Task<Invoice> GetById(int id)
        {
            return await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Subscription)
                    .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        /// <summary>
        /// سداد فاتورة اشتراك → إنشاء دفعة + قيد وارد في صندوق التفعيلات (ACT)
        /// </summary>
        public async Task<object> MarkAsPaid(int id, int? userId = null, int? cashBoxId = null)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Subscription)
                    .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                throw new Exception("الفاتورة غير موجودة");

            if (invoice.IsPaid)
                throw new Exception("الفاتورة مدفوعة مسبقاً");

            // صندوق التفعيلات افتراضياً لفواتير الاشتراك
            CashBox actBox = null;
            if (cashBoxId.HasValue && cashBoxId.Value > 0)
            {
                actBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Id == cashBoxId.Value && c.IsActive);
            }
            if (actBox == null)
            {
                actBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "ACT" && c.IsActive);
            }
            if (actBox == null)
                throw new Exception("صندوق التفعيلات (ACT) غير موجود — أعد تهيئة المحاسبة");

            // حساب إيرادات الاشتراكات إن وُجد
            var revenueAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Code == "4-1-2" && a.IsActive);

            invoice.IsPaid = true;
            invoice.PaidAt = DateTime.Now;
            invoice.Status = "Paid";

            var payment = new Payment
            {
                ClientId = invoice.ClientId,
                SubscriptionId = invoice.SubscriptionId,
                InvoiceId = invoice.Id,
                Amount = invoice.Total,
                Date = DateTime.Now,
                PaymentMethod = "Cash",
                Status = "Completed",
                Notes = $"سداد فاتورة اشتراك {invoice.InvoiceNumber}",
                CashBoxId = actBox.Id
            };
            _context.Payments.Add(payment);

            // تحديث حالة دفع العميل
            var client = invoice.Client ?? await _context.Clients.FindAsync(invoice.ClientId);
            if (client != null)
                client.PaymentStatus = "Paid";

            await _context.SaveChangesAsync();

            if (invoice.Total > 0)
            {
                await _cashBoxes.PostReference(
                    actBox.Id,
                    "In",
                    invoice.Total,
                    revenueAccount?.Id ?? actBox.AccountId,
                    "Invoice",
                    invoice.Id,
                    $"فاتورة اشتراك {invoice.InvoiceNumber} — {client?.FullName ?? client?.Username}",
                    userId);
            }

            return new
            {
                invoice.Id,
                invoice.InvoiceNumber,
                invoice.Total,
                invoice.IsPaid,
                invoice.PaidAt,
                invoice.Status,
                PaymentId = payment.Id,
                CashBoxId = actBox.Id,
                CashBoxName = actBox.Name,
                CashBoxCode = actBox.Code,
                message = "تم سداد الفاتورة وإضافتها لصندوق التفعيلات"
            };
        }
    }
}
