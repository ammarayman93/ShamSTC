using System;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class PurchaseService
    {
        private readonly AppDbContext _context;

        public PurchaseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetAll(int page = 1, int pageSize = 20)
        {
            var total = await _context.Purchases.CountAsync();

            var data = await _context.Purchases
                .Include(p => p.Product)
                .OrderByDescending(p => p.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.ProductId,
                    ProductName = p.ProductName ?? (p.Product != null ? p.Product.Name : ""),
                    ModelNumber = p.ModelNumber ?? (p.Product != null ? p.Product.ModelNumber : null),
                    p.Quantity,
                    p.CostPerUnit,
                    p.Total,
                    p.Supplier,
                    p.InvoiceNumber,
                    p.Date,
                    p.Notes
                })
                .ToListAsync();

            return new { total, page, pageSize, data };
        }

        public async Task<Purchase> Create(CreatePurchaseDto dto)
        {
            if (dto.Quantity <= 0)
                throw new Exception("الكمية يجب أن تكون أكبر من صفر");

            if (dto.CostPerUnit < 0)
                throw new Exception("سعر الوحدة غير صالح");

            Product product;

            if (dto.ProductId.HasValue && dto.ProductId > 0)
            {
                product = await _context.Products.FindAsync(dto.ProductId.Value);
                if (product == null)
                    throw new Exception("المنتج غير موجود");
            }
            else
            {
                // إنشاء منتج جديد إذا لم يُحدد ProductId
                if (string.IsNullOrWhiteSpace(dto.ProductName))
                    throw new Exception("يجب تحديد منتج موجود أو إدخال اسم منتج جديد");

                product = new Product
                {
                    Name = dto.ProductName.Trim(),
                    ModelNumber = dto.ModelNumber?.Trim(),
                    CostPrice = dto.CostPerUnit,
                    SellPrice = dto.CostPerUnit * 1.3m,
                    Quantity = 0,
                    IsActive = true,
                    CreatedAt = DateTime.Now
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();
            }

            var total = dto.CostPerUnit * dto.Quantity;

            var purchase = new Purchase
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ModelNumber = product.ModelNumber,
                Quantity = dto.Quantity,
                CostPerUnit = dto.CostPerUnit,
                Total = total,
                Supplier = dto.Supplier?.Trim(),
                InvoiceNumber = dto.InvoiceNumber?.Trim(),
                Date = DateTime.Now,
                Notes = dto.Notes
            };

            // زيادة كمية المخزون
            product.Quantity += dto.Quantity;

            // تحديث سعر التكلفة إذا طُلب
            if (dto.UpdateProductCostPrice)
            {
                product.CostPrice = dto.CostPerUnit;
            }

            product.UpdatedAt = DateTime.Now;

            _context.Purchases.Add(purchase);
            await _context.SaveChangesAsync();

            return purchase;
        }

        public async Task<bool> Delete(int id)
        {
            var purchase = await _context.Purchases
                .Include(p => p.Product)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (purchase == null)
                return false;

            // خصم الكمية من المخزون (إذا كان المنتج موجوداً)
            if (purchase.Product != null)
            {
                purchase.Product.Quantity = Math.Max(0, purchase.Product.Quantity - purchase.Quantity);
                purchase.Product.UpdatedAt = DateTime.Now;
            }

            _context.Purchases.Remove(purchase);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
