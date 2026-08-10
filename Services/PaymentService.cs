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
        /// تحصيل اشتراك / دفعة عميل → صندوق التفعيلات (ACT)
        /// </summary>
        public async Task<Payment> Pay(int clientId, decimal amount, int? cashBoxId = null, string notes = null, int? userId = null)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client == null)
                throw new Exception("العميل غير موجود");

            var activeSubscription = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(x => x.ClientId == clientId && x.IsActive)
                .OrderByDescending(x => x.EndDate)
                .FirstOrDefaultAsync();

            if (activeSubscription == null)
                throw new Exception("لا يوجد اشتراك نشط");

            if (activeSubscription.Plan != null)
            {
                var duration = activeSubscription.Plan.DurationDays;
                var newEndDate = activeSubscription.EndDate > DateTime.Now
                    ? activeSubscription.EndDate.AddDays(duration)
                    : DateTime.Now.AddDays(duration);
                activeSubscription.EndDate = newEndDate;
                activeSubscription.PaidAmount += amount;
            }

            if (cashBoxId == null)
            {
                var act = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "ACT" && c.IsActive);
                cashBoxId = act?.Id;
            }

            var payment = new Payment
            {
                ClientId = clientId,
                SubscriptionId = activeSubscription?.Id,
                Amount = amount,
                Date = DateTime.Now,
                Status = "Completed",
                PaymentMethod = "Cash",
                Notes = notes,
                CashBoxId = cashBoxId
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if (cashBoxId.HasValue && amount > 0)
            {
                await _cashBoxes.PostReference(
                    cashBoxId.Value,
                    "In",
                    amount,
                    null,
                    "Payment",
                    payment.Id,
                    $"تحصيل اشتراك — {client.FullName ?? client.Username}",
                    userId);
            }

            return payment;
        }

        public async Task<Payment> Create(CreatePaymentDto dto, int? userId = null)
        {
            return await Pay(dto.ClientId, dto.Amount, dto.CashBoxId, dto.Notes, userId);
        }

        public async Task<IEnumerable<object>> GetAll()
        {
            return await _context.Payments
                .Include(p => p.Client)
                .Include(p => p.CashBox)
                .OrderByDescending(p => p.Date)
                .Select(p => new
                {
                    p.Id,
                    p.ClientId,
                    ClientName = p.Client != null ? p.Client.FullName : null,
                    p.Amount,
                    p.Date,
                    p.Status,
                    p.PaymentMethod,
                    p.Notes,
                    p.CashBoxId,
                    CashBoxName = p.CashBox != null ? p.CashBox.Name : null
                })
                .ToListAsync();
        }
    }
}
