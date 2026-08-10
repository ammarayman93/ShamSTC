using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class PaymentService
    {
        private readonly AppDbContext _context;
        private readonly CashBoxService _cashBoxes;

        public PaymentService(AppDbContext context, CashBoxService cashBoxes)
        {
            _context = context;
            _cashBoxes = cashBoxes;
        }

        /// <summary>
        /// تحصيل اشتراك / دفعة عميل → صندوق التفعيلات (ACT) دائماً ما لم يُحدد صندوق آخر.
        /// يربط الفاتورة إن وُجدت، ويمدّد الاشتراك حتى الساعة 12 ظهراً.
        /// </summary>
        public async Task<object> Pay(
            int clientId,
            decimal amount,
            int? cashBoxId = null,
            string notes = null,
            int? userId = null,
            int? invoiceId = null,
            bool extendSubscription = true)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client == null)
                throw new Exception("العميل غير موجود");

            if (amount <= 0)
                throw new Exception("المبلغ يجب أن يكون أكبر من صفر");

            var activeSubscription = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(x => x.ClientId == clientId)
                .OrderByDescending(x => x.EndDate)
                .FirstOrDefaultAsync();

            Invoice invoice = null;
            if (invoiceId.HasValue && invoiceId.Value > 0)
            {
                invoice = await _context.Invoices.FindAsync(invoiceId.Value);
                if (invoice == null)
                    throw new Exception("الفاتورة غير موجودة");
                if (invoice.ClientId != clientId)
                    throw new Exception("الفاتورة لا تتبع لهذا العميل");
                if (invoice.IsPaid)
                    throw new Exception("الفاتورة مدفوعة مسبقاً");
            }

            // تمديد الاشتراك (تحصيل اشتراك)
            if (extendSubscription && activeSubscription != null)
            {
                var duration = activeSubscription.Plan?.DurationDays ?? 30;
                if (duration < 1) duration = 30;
                activeSubscription.EndDate = SubscriptionService.ExtendEndAtNoon(activeSubscription.EndDate, duration);
                activeSubscription.IsActive = true;
                activeSubscription.Status = "Active";
                activeSubscription.PaidAmount += amount;
                activeSubscription.RenewedAt = DateTime.Now;
            }

            // صندوق التفعيلات افتراضي
            CashBox box = null;
            if (cashBoxId.HasValue && cashBoxId.Value > 0)
                box = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Id == cashBoxId.Value && c.IsActive);
            if (box == null)
                box = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "ACT" && c.IsActive);
            if (box == null)
                throw new Exception("صندوق التفعيلات (ACT) غير موجود — أعد تهيئة المحاسبة");

            var revenueAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Code == "4-1-2" && a.IsActive);

            // إنشاء فاتورة إن لم تُمرَّر (فاتورة اشتراك مدفوعة)
            if (invoice == null && activeSubscription != null)
            {
                invoice = new Invoice
                {
                    InvoiceNumber = $"INV-PAY-{DateTime.Now:yyyyMMddHHmmss}-{clientId}",
                    ClientId = clientId,
                    SubscriptionId = activeSubscription.Id,
                    SubTotal = amount,
                    Tax = 0,
                    Discount = 0,
                    Total = amount,
                    Date = DateTime.Now,
                    DueDate = DateTime.Now,
                    IsPaid = true,
                    PaidAt = DateTime.Now,
                    Status = "Paid",
                    Notes = notes ?? "تحصيل اشتراك"
                };
                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();
            }
            else if (invoice != null)
            {
                invoice.IsPaid = true;
                invoice.PaidAt = DateTime.Now;
                invoice.Status = "Paid";
            }

            var payment = new Payment
            {
                ClientId = clientId,
                SubscriptionId = activeSubscription?.Id ?? invoice?.SubscriptionId,
                InvoiceId = invoice?.Id,
                Amount = amount,
                Date = DateTime.Now,
                Status = "Completed",
                PaymentMethod = "Cash",
                Notes = notes ?? $"تحصيل اشتراك — {client.FullName ?? client.Username}",
                CashBoxId = box.Id
            };

            _context.Payments.Add(payment);
            client.PaymentStatus = "Paid";
            if (client.Status == "Expired" || client.Status == "Suspended")
                client.Status = "Active";

            await _context.SaveChangesAsync();

            await _cashBoxes.PostReference(
                box.Id,
                "In",
                amount,
                revenueAccount?.Id ?? box.AccountId,
                "Payment",
                payment.Id,
                payment.Notes,
                userId);

            return new
            {
                payment.Id,
                payment.ClientId,
                payment.Amount,
                payment.Date,
                payment.Status,
                payment.CashBoxId,
                CashBoxName = box.Name,
                CashBoxCode = box.Code,
                InvoiceId = invoice?.Id,
                InvoiceNumber = invoice?.InvoiceNumber,
                SubscriptionId = activeSubscription?.Id,
                NewEndDate = activeSubscription?.EndDate
            };
        }

        public async Task<object> Create(CreatePaymentDto dto, int? userId = null)
        {
            return await Pay(
                dto.ClientId,
                dto.Amount,
                dto.CashBoxId,
                dto.Notes,
                userId,
                dto.InvoiceId,
                extendSubscription: true);
        }

        public async Task<IEnumerable<object>> GetAll()
        {
            return await _context.Payments
                .Include(p => p.Client)
                .Include(p => p.CashBox)
                .Include(p => p.Invoice)
                .OrderByDescending(p => p.Date)
                .Select(p => new
                {
                    p.Id,
                    p.ClientId,
                    ClientName = p.Client != null ? p.Client.FullName : null,
                    ClientUsername = p.Client != null ? p.Client.Username : null,
                    p.Amount,
                    p.Date,
                    p.Status,
                    p.PaymentMethod,
                    p.Notes,
                    p.CashBoxId,
                    CashBoxName = p.CashBox != null ? p.CashBox.Name : null,
                    CashBoxCode = p.CashBox != null ? p.CashBox.Code : null,
                    p.InvoiceId,
                    InvoiceNumber = p.Invoice != null ? p.Invoice.InvoiceNumber : null,
                    p.SubscriptionId
                })
                .ToListAsync();
        }
    }
}
