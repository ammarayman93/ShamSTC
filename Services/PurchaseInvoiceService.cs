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
    public class PurchaseInvoiceService
    {
        private readonly AppDbContext _context;
        private readonly CashBoxService _cashBoxes;

        public PurchaseInvoiceService(AppDbContext context, CashBoxService cashBoxes)
        {
            _context = context;
            _cashBoxes = cashBoxes;
        }

        public async Task<object> GetAll(string search = null, int page = 1, int pageSize = 20)
        {
            var q = _context.PurchaseInvoices
                .Include(i => i.CashBox)
                .Include(i => i.Items)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();
                q = q.Where(i =>
                    i.InvoiceNumber.Contains(search) ||
                    i.SupplierName.Contains(search));
            }

            var total = await q.CountAsync();
            var data = await q
                .OrderByDescending(i => i.Date)
                .ThenByDescending(i => i.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new PurchaseInvoiceListDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    SupplierName = i.SupplierName,
                    Date = i.Date,
                    Total = i.Total,
                    PaidAmount = i.PaidAmount,
                    PaymentStatus = i.PaymentStatus,
                    CashBoxName = i.CashBox != null ? i.CashBox.Name : null,
                    ItemsCount = i.Items.Count
                })
                .ToListAsync();

            return new { data, total, page, pageSize };
        }

        public async Task<PurchaseInvoiceDetailDto> GetById(int id)
        {
            var i = await _context.PurchaseInvoices
                .Include(x => x.CashBox)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (i == null) return null;
            return MapDetail(i);
        }

        public async Task<PurchaseInvoiceDetailDto> Create(CreatePurchaseInvoiceDto dto, int? userId)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                throw new Exception("يجب إضافة بند واحد على الأقل");

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoiceNumber = string.IsNullOrWhiteSpace(dto.InvoiceNumber)
                    ? await GenerateNumber()
                    : dto.InvoiceNumber.Trim();

                if (await _context.PurchaseInvoices.AnyAsync(x => x.InvoiceNumber == invoiceNumber))
                    throw new Exception("رقم الفاتورة موجود مسبقاً");

                var items = new List<PurchaseInvoiceItem>();
                decimal subTotal = 0;

                foreach (var line in dto.Items)
                {
                    var product = await _context.Products.FindAsync(line.ProductId);
                    if (product == null)
                        throw new Exception($"المادة رقم {line.ProductId} غير موجودة");

                    var lineTotal = Math.Round(line.Quantity * line.UnitCost, 2);
                    subTotal += lineTotal;

                    items.Add(new PurchaseInvoiceItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductCode = product.Code,
                        Quantity = line.Quantity,
                        UnitCost = line.UnitCost,
                        LineTotal = lineTotal
                    });

                    // زيادة المخزون
                    var qtyInt = (int)Math.Round(line.Quantity);
                    product.Quantity += qtyInt;
                    // تحديث تكلفة تقريبية (آخر شراء)
                    product.CostPrice = line.UnitCost;
                    product.UpdatedAt = DateTime.Now;

                    // سجل Purchase القديم للتوافق مع الشاشات القديمة
                    _context.Purchases.Add(new Purchase
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ModelNumber = product.ModelNumber,
                        Quantity = qtyInt,
                        CostPerUnit = line.UnitCost,
                        Total = lineTotal,
                        Supplier = dto.SupplierName,
                        InvoiceNumber = invoiceNumber,
                        Date = dto.Date ?? DateTime.Now,
                        Notes = dto.Notes,
                        CreatedBy = userId
                    });
                }

                subTotal = Math.Round(subTotal, 2);
                var tax = Math.Round(dto.Tax, 2);
                var discount = Math.Round(dto.Discount, 2);
                var total = Math.Round(subTotal + tax - discount, 2);
                if (total < 0) total = 0;

                var status = string.IsNullOrWhiteSpace(dto.PaymentStatus) ? "Paid" : dto.PaymentStatus;
                var paid = status == "Paid" ? total
                    : status == "Unpaid" ? 0
                    : Math.Min(dto.PaidAmount ?? 0, total);

                // صندوق المشتريات افتراضياً
                int? cashBoxId = dto.CashBoxId;
                if (cashBoxId == null && paid > 0)
                {
                    var purBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "PUR" && c.IsActive);
                    cashBoxId = purBox?.Id;
                }

                var invoice = new PurchaseInvoice
                {
                    InvoiceNumber = invoiceNumber,
                    SupplierName = dto.SupplierName.Trim(),
                    SupplierPhone = dto.SupplierPhone,
                    Date = dto.Date ?? DateTime.Now,
                    SubTotal = subTotal,
                    Tax = tax,
                    Discount = discount,
                    Total = total,
                    PaymentStatus = status,
                    PaidAmount = paid,
                    CashBoxId = cashBoxId,
                    Notes = dto.Notes,
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now,
                    Items = items
                };

                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                // خصم من صندوق المشتريات
                if (paid > 0 && cashBoxId.HasValue)
                {
                    await _cashBoxes.PostReference(
                        cashBoxId.Value,
                        "Out",
                        paid,
                        null,
                        "PurchaseInvoice",
                        invoice.Id,
                        $"فاتورة مشتريات {invoice.InvoiceNumber} — {invoice.SupplierName}",
                        userId);
                }

                await tx.CommitAsync();
                return await GetById(invoice.Id);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            var invoice = await _context.PurchaseInvoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);
            if (invoice == null) return false;

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                // عكس المخزون
                foreach (var line in invoice.Items)
                {
                    var product = await _context.Products.FindAsync(line.ProductId);
                    if (product != null)
                    {
                        var q = (int)Math.Round(line.Quantity);
                        product.Quantity = Math.Max(0, product.Quantity - q);
                        product.UpdatedAt = DateTime.Now;
                    }
                }

                // ملاحظة: عكس حركة الصندوق يدوياً إن لزم — هنا نحذف الفاتورة فقط
                _context.PurchaseInvoices.Remove(invoice);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        private async Task<string> GenerateNumber()
        {
            var year = DateTime.Now.Year;
            var prefix = $"PI-{year}-";
            var last = await _context.PurchaseInvoices
                .Where(i => i.InvoiceNumber.StartsWith(prefix))
                .OrderByDescending(i => i.InvoiceNumber)
                .Select(i => i.InvoiceNumber)
                .FirstOrDefaultAsync();

            int seq = 1;
            if (last != null)
            {
                var part = last.Replace(prefix, "");
                if (int.TryParse(part, out var n)) seq = n + 1;
            }
            return $"{prefix}{seq:D5}";
        }

        private static PurchaseInvoiceDetailDto MapDetail(PurchaseInvoice i) => new()
        {
            Id = i.Id,
            InvoiceNumber = i.InvoiceNumber,
            SupplierName = i.SupplierName,
            SupplierPhone = i.SupplierPhone,
            Date = i.Date,
            SubTotal = i.SubTotal,
            Tax = i.Tax,
            Discount = i.Discount,
            Total = i.Total,
            PaidAmount = i.PaidAmount,
            PaymentStatus = i.PaymentStatus,
            CashBoxId = i.CashBoxId,
            CashBoxName = i.CashBox?.Name,
            Notes = i.Notes,
            CreatedAt = i.CreatedAt,
            Items = i.Items?.Select(x => new PurchaseInvoiceItemDetailDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                ProductCode = x.ProductCode,
                Quantity = x.Quantity,
                UnitCost = x.UnitCost,
                LineTotal = x.LineTotal
            }).ToList() ?? new List<PurchaseInvoiceItemDetailDto>()
        };
    }
}
