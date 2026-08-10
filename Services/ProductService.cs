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
    public class ProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetAll(string search = null, int page = 1, int pageSize = 20)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();
                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    p.ModelNumber.Contains(search) ||
                    (p.SerialNumber != null && p.SerialNumber.Contains(search)));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.ModelNumber,
                    p.SerialNumber,
                    p.CostPrice,
                    p.SellPrice,
                    p.Quantity,
                    p.Description,
                    p.MinStockAlert,
                    p.IsActive,
                    p.CreatedAt,
                    IsLowStock = p.Quantity <= (p.MinStockAlert ?? 5)
                })
                .ToListAsync();

            return new { total, page, pageSize, data };
        }

        public async Task<Product> GetById(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task<Product> Create(CreateProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new Exception("«”„ «·„‰ Ã „ÿ·Ê»");

            var product = new Product
            {
                Name = dto.Name.Trim(),
                ModelNumber = dto.ModelNumber?.Trim(),
                SerialNumber = dto.SerialNumber?.Trim(),
                CostPrice = dto.CostPrice,
                SellPrice = dto.SellPrice,
                Quantity = dto.Quantity,
                Description = dto.Description,
                MinStockAlert = dto.MinStockAlert ?? 5,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> Update(int id, UpdateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                throw new Exception("«·„‰ Ã €Ì— „ÊÃÊœ");

            if (!string.IsNullOrWhiteSpace(dto.Name))
                product.Name = dto.Name.Trim();

            if (dto.ModelNumber != null)
                product.ModelNumber = dto.ModelNumber.Trim();

            if (dto.SerialNumber != null)
                product.SerialNumber = dto.SerialNumber.Trim();

            if (dto.CostPrice.HasValue)
                product.CostPrice = dto.CostPrice.Value;

            product.SellPrice = dto.SellPrice;
            product.Description = dto.Description ?? product.Description;

            if (dto.MinStockAlert.HasValue)
                product.MinStockAlert = dto.MinStockAlert;

            if (dto.IsActive.HasValue)
                product.IsActive = dto.IsActive.Value;

            product.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<bool> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            // „‰⁄ «·Õ–› ≈–« ﬂ«‰ ⁄·ÌÂ Õ—ﬂ« 
            var hasPurchases = await _context.Purchases.AnyAsync(p => p.ProductId == id);
            var hasSales = await _context.Sales.AnyAsync(s => s.ProductId == id);

            if (hasPurchases || hasSales)
            {
                // »œ·« „‰ «·Õ–› ‰⁄ÿ·Â
                product.IsActive = false;
                product.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                return true;
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}