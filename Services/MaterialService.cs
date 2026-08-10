using System;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class MaterialService
    {
        private readonly AppDbContext _context;

        public MaterialService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetAll(string search = null, string category = null, int page = 1, int pageSize = 20)
        {
            var query = _context.Products
                .Include(p => p.InventoryAccount)
                .Include(p => p.CostAccount)
                .Include(p => p.RevenueAccount)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();
                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    (p.Code != null && p.Code.Contains(search)) ||
                    (p.ModelNumber != null && p.ModelNumber.Contains(search)) ||
                    (p.Barcode != null && p.Barcode.Contains(search)) ||
                    (p.SerialNumber != null && p.SerialNumber.Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(p => p.Category == category);

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => MapExpr(p))
                .ToListAsync();

            return new { data, total, page, pageSize };
        }

        public async Task<MaterialDto> GetById(int id)
        {
            var p = await _context.Products
                .Include(x => x.InventoryAccount)
                .Include(x => x.CostAccount)
                .Include(x => x.RevenueAccount)
                .FirstOrDefaultAsync(x => x.Id == id);
            return p == null ? null : Map(p);
        }

        public async Task<MaterialDto> Create(CreateMaterialDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Code) &&
                await _context.Products.AnyAsync(p => p.Code == dto.Code))
                throw new Exception("رمز المادة موجود مسبقاً");

            var product = new Product
            {
                Code = string.IsNullOrWhiteSpace(dto.Code) ? await GenerateCode() : dto.Code.Trim(),
                Name = dto.Name.Trim(),
                Unit = string.IsNullOrWhiteSpace(dto.Unit) ? "قطعة" : dto.Unit.Trim(),
                Category = dto.Category?.Trim(),
                ModelNumber = dto.ModelNumber?.Trim(),
                SerialNumber = dto.SerialNumber?.Trim(),
                Barcode = dto.Barcode?.Trim(),
                CostPrice = dto.CostPrice,
                SellPrice = dto.SellPrice,
                Quantity = dto.Quantity,
                MinStockAlert = dto.MinStockAlert ?? 5,
                Description = dto.Description,
                InventoryAccountId = dto.InventoryAccountId,
                CostAccountId = dto.CostAccountId,
                RevenueAccountId = dto.RevenueAccountId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            // ربط افتراضي بحسابات الدليل إن وُجدت
            if (product.InventoryAccountId == null)
            {
                var inv = await _context.Accounts.FirstOrDefaultAsync(a => a.Code == "1-1-3");
                if (inv != null) product.InventoryAccountId = inv.Id;
            }
            if (product.RevenueAccountId == null)
            {
                var rev = await _context.Accounts.FirstOrDefaultAsync(a => a.Code == "4-1-1");
                if (rev != null) product.RevenueAccountId = rev.Id;
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return await GetById(product.Id);
        }

        public async Task<MaterialDto> Update(int id, UpdateMaterialDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Code) && dto.Code != product.Code &&
                await _context.Products.AnyAsync(p => p.Code == dto.Code && p.Id != id))
                throw new Exception("رمز المادة موجود مسبقاً");

            if (!string.IsNullOrWhiteSpace(dto.Code)) product.Code = dto.Code.Trim();
            product.Name = dto.Name.Trim();
            if (dto.Unit != null) product.Unit = dto.Unit;
            product.Category = dto.Category;
            product.ModelNumber = dto.ModelNumber;
            product.SerialNumber = dto.SerialNumber;
            product.Barcode = dto.Barcode;
            if (dto.CostPrice.HasValue) product.CostPrice = dto.CostPrice.Value;
            if (dto.SellPrice.HasValue) product.SellPrice = dto.SellPrice.Value;
            if (dto.MinStockAlert.HasValue) product.MinStockAlert = dto.MinStockAlert;
            product.Description = dto.Description;
            if (dto.IsActive.HasValue) product.IsActive = dto.IsActive.Value;
            product.InventoryAccountId = dto.InventoryAccountId;
            product.CostAccountId = dto.CostAccountId;
            product.RevenueAccountId = dto.RevenueAccountId;
            product.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return await GetById(id);
        }

        public async Task<MaterialDto> AdjustStock(int id, AdjustStockDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            var mode = (dto.Mode ?? "Set").Trim();
            if (mode == "Add")
                product.Quantity += dto.Quantity;
            else if (mode == "Subtract")
            {
                if (product.Quantity < dto.Quantity)
                    throw new Exception("الكمية غير كافية");
                product.Quantity -= dto.Quantity;
            }
            else
                product.Quantity = dto.Quantity;

            if (product.Quantity < 0)
                throw new Exception("لا يمكن أن تكون الكمية سالبة");

            product.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return await GetById(id);
        }

        public async Task<bool> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            // تعطيل بدل الحذف إن وُجدت حركات
            var hasMoves = await _context.Purchases.AnyAsync(p => p.ProductId == id)
                        || await _context.Sales.AnyAsync(s => s.ProductId == id);
            if (hasMoves)
            {
                product.IsActive = false;
                product.UpdatedAt = DateTime.Now;
            }
            else
            {
                _context.Products.Remove(product);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetLowStock()
        {
            var list = await _context.Products
                .Where(p => p.IsActive && p.Quantity <= (p.MinStockAlert ?? 5))
                .OrderBy(p => p.Quantity)
                .Select(p => MapExpr(p))
                .ToListAsync();
            return list;
        }

        public async Task<object> GetCategories()
        {
            return await _context.Products
                .Where(p => p.Category != null && p.Category != "")
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        private async Task<string> GenerateCode()
        {
            var count = await _context.Products.CountAsync() + 1;
            return $"MAT-{count:D5}";
        }

        private static MaterialDto Map(Product p) => new MaterialDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Unit = p.Unit,
            Category = p.Category,
            ModelNumber = p.ModelNumber,
            SerialNumber = p.SerialNumber,
            Barcode = p.Barcode,
            CostPrice = p.CostPrice,
            SellPrice = p.SellPrice,
            Quantity = p.Quantity,
            MinStockAlert = p.MinStockAlert,
            IsLowStock = p.Quantity <= (p.MinStockAlert ?? 5),
            Description = p.Description,
            InventoryAccountId = p.InventoryAccountId,
            InventoryAccountName = p.InventoryAccount?.Name,
            CostAccountId = p.CostAccountId,
            CostAccountName = p.CostAccount?.Name,
            RevenueAccountId = p.RevenueAccountId,
            RevenueAccountName = p.RevenueAccount?.Name,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };

        // للـ Select في EF
        private static MaterialDto MapExpr(Product p) => new MaterialDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Unit = p.Unit,
            Category = p.Category,
            ModelNumber = p.ModelNumber,
            SerialNumber = p.SerialNumber,
            Barcode = p.Barcode,
            CostPrice = p.CostPrice,
            SellPrice = p.SellPrice,
            Quantity = p.Quantity,
            MinStockAlert = p.MinStockAlert,
            IsLowStock = p.Quantity <= (p.MinStockAlert ?? 5),
            Description = p.Description,
            InventoryAccountId = p.InventoryAccountId,
            InventoryAccountName = p.InventoryAccount != null ? p.InventoryAccount.Name : null,
            CostAccountId = p.CostAccountId,
            CostAccountName = p.CostAccount != null ? p.CostAccount.Name : null,
            RevenueAccountId = p.RevenueAccountId,
            RevenueAccountName = p.RevenueAccount != null ? p.RevenueAccount.Name : null,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
