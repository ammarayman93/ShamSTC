using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExpiringSubscriptionDto>> GetExpiringSubscriptions(int daysThreshold = 3)
        {
            var expiringDate = DateTime.Now.AddDays(daysThreshold);

            var expiringSubs = await _context.Subscriptions
                .Include(s => s.Client)
                .Include(s => s.Plan)
                .Where(s => s.IsActive && s.EndDate <= expiringDate && s.EndDate > DateTime.Now)
                .Select(s => new ExpiringSubscriptionDto
                {
                    ClientId = s.ClientId,
                    Username = s.Client.Username,
                    FullName = s.Client.FullName,
                    PlanName = s.Plan.Name,
                    EndDate = s.EndDate,
                    DaysRemaining = (int)(s.EndDate - DateTime.Now).TotalDays
                })
                .ToListAsync();

            return expiringSubs;
        }

        public async Task<List<LowStockProductDto>> GetLowStockProducts(int threshold = 5)
        {
            var lowStock = await _context.Products
                .Where(p => p.Quantity <= threshold)
                .Select(p => new LowStockProductDto
                {
                    ProductId = p.Id,
                    ProductName = p.Name,
                    CurrentStock = p.Quantity,
                    Threshold = threshold
                })
                .ToListAsync();

            return lowStock;
        }

        public async Task NotifyPendingInvoices()
        {
            var dueInvoices = await _context.Invoices
                .Where(i => i.Date <= DateTime.Now && !i.IsPaid)
                .Include(i => i.Client)
                .ToListAsync();

            foreach (var invoice in dueInvoices)
            {
                var client = invoice.Client;
                if (client != null)
                {
                    Console.WriteLine($"Invoice {invoice.Id} is pending for client {client.FullName}");
                }
            }
        }
    }

    public class ExpiringSubscriptionDto
    {
        public int ClientId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string PlanName { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRemaining { get; set; }
    }

    public class LowStockProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int CurrentStock { get; set; }
        public int Threshold { get; set; }
    }
}