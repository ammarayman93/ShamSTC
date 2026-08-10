using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ISPSystem.Services
{
    public class InvoiceService
    {
        private readonly AppDbContext _context;

        public InvoiceService(AppDbContext context)
        {
            _context = context;
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

        public async Task<List<Invoice>> GetAll()
        {
            return await _context.Invoices
                .Include(i => i.Subscription) // التأكد من ربط الفاتورة بالاشتراك
                .ToListAsync();
        }
        public async Task<Invoice> GetById(int id)
        {
            return await _context.Invoices
                .Include(i => i.Subscription)
                .FirstOrDefaultAsync(i => i.Id == id);
        }
    }
}