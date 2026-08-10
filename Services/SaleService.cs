using System;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class SaleService
    {
        private readonly AppDbContext _context;

        public SaleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetAll(int page = 1, int pageSize = 20)
        {
            var total = await _context.Sales.CountAsync();
            var data = await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Client)
                .OrderByDescending(s => s.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.ProductId,
                    ProductName = s.ProductName ?? s.Product.Name,
                    ModelNumber = s.ModelNumber ?? s.Product.ModelNumber,
                    s.Quantity,
                    s.UnitSellPrice,
                    s.Total,
                    s.ClientId,
                    ClientName = s.ClientName ?? (s.Client != null ? s.Client.FullName : null),
                    s.SerialNumber,
                    s.Date,
                    s.Notes
                })
                .ToListAsync();

            return new { total, page, pageSize, data };
        }

        public async Task<Sale> Sell(CreateSaleDto dto)
        {
            if (dto.Quantity <= 0)
                throw new Exception("كمية البيع يجب أن تكون أكبر من صفر");

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) throw new Exception("المنتج غير موجود");
            if (!product.IsActive) throw new Exception("المنتج غير نشط");
            if (product.Quantity < dto.Quantity)
                throw new Exception($"الكمية المتوفرة غير كافية (المتوفر: {product.Quantity})");

            var unitPrice = dto.UnitSellPrice ?? product.SellPrice;
            var total = unitPrice * dto.Quantity;
            string clientName = dto.ClientName;

            if (dto.ClientId.HasValue)
            {
                var client = await _context.Clients.FindAsync(dto.ClientId.Value);
                if (client != null) clientName = client.FullName;
            }

            var sale = new Sale
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ModelNumber = product.ModelNumber,
                Quantity = dto.Quantity,
                UnitSellPrice = unitPrice,
                Total = total,
                ClientId = dto.ClientId,
                ClientName = clientName,
                SerialNumber = dto.SerialNumber,
                Date = DateTime.Now,
                Notes = dto.Notes
            };

            product.Quantity -= dto.Quantity;
            product.UpdatedAt = DateTime.Now;

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            return sale;
        }
    }
}