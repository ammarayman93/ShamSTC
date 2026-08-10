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
    public class SalesInvoiceService
    {
        private readonly AppDbContext _context;
        private readonly CashBoxService _cashBoxes;

        public SalesInvoiceService(AppDbContext context, CashBoxService cashBoxes)
        {
            _context = context;
            _cashBoxes = cashBoxes;
        }

        public async Task<object> GetAll(string search = null, int page = 1, int pageSize = 20)
        {
            var q = _context.SalesInvoices
                .Include(i => i.CashBox)
                .Include(i => i.Items)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();
                q = q.Where(i =>
                    i.InvoiceNumber.Contains(search) ||
                    (i.ClientName != null && i.ClientName.Contains(search)));
            }

            var total = await q.CountAsync();
            var data = await q
                .OrderByDescending(i => i.Date)
                .ThenByDescending(i => i.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new SalesInvoiceListDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    ClientName = i.ClientName,
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

        public async Task<SalesInvoiceDetailDto> GetById(int id)
        {
            var i = await _context.SalesInvoices
                .Include(x => x.CashBox)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id);
            return i == null ? null : MapDetail(i);
        }

        public async Task<SalesInvoiceDetailDto> Create(CreateSalesInvoiceDto dto, int? userId)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                throw new Exception("يجب إضافة بند واحد على الأقل");

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoiceNumber = string.IsNullOrWhiteSpace(dto.InvoiceNumber)
                    ? await GenerateNumber()
                    : dto.InvoiceNumber.Trim();

                if (await _context.SalesInvoices.AnyAsync(x => x.InvoiceNumber == invoiceNumber))
                    throw new Exception("رقم الفاتورة موجود مسبقاً");

                string clientName = dto.ClientName;
                string clientPhone = dto.ClientPhone;
                if (dto.ClientId.HasValue)
                {
                    var client = await _context.Clients.FindAsync(dto.ClientId.Value);
                    if (client == null)
                        throw new Exception("العميل غير موجود");
                    if (string.IsNullOrWhiteSpace(clientName))
                        clientName = client.FullName;
                    if (string.IsNullOrWhiteSpace(clientPhone))
                        clientPhone = client.Phone;
                }

                var items = new List<SalesInvoiceItem>();
                decimal subTotal = 0;

                foreach (var line in dto.Items)
                {
                    var product = await _context.Products.FindAsync(line.ProductId);
                    if (product == null)
                        throw new Exception($"المادة رقم {line.ProductId} غير موجودة");

                    var qtyInt = (int)Math.Round(line.Quantity);
                    if (product.Quantity < qtyInt)
                        throw new Exception($"الكمية غير كافية للمادة: {product.Name} (المتوفر {product.Quantity})");

                    var lineTotal = Math.Round(line.Quantity * line.UnitPrice, 2);
                    subTotal += lineTotal;

                    items.Add(new SalesInvoiceItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductCode = product.Code,
                        Quantity = line.Quantity,
                        UnitPrice = line.UnitPrice,
                        LineTotal = lineTotal
                    });

                    product.Quantity -= qtyInt;
                    product.UpdatedAt = DateTime.Now;

                    // توافق مع جدول Sales القديم
                    _context.Sales.Add(new Sale
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ModelNumber = product.ModelNumber,
                        SerialNumber = product.SerialNumber,
                        Quantity = qtyInt,
                        UnitSellPrice = line.UnitPrice,
                        Total = lineTotal,
                        ClientId = dto.ClientId,
                        ClientName = clientName,
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

                int? cashBoxId = dto.CashBoxId;
                if (cashBoxId == null && paid > 0)
                {
                    var salesBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "SALES" && c.IsActive);
                    cashBoxId = salesBox?.Id;
                }

                var invoice = new SalesInvoice
                {
                    InvoiceNumber = invoiceNumber,
                    ClientId = dto.ClientId,
                    ClientName = clientName,
                    ClientPhone = clientPhone,
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

                _context.SalesInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                if (paid > 0 && cashBoxId.HasValue)
                {
                    await _cashBoxes.PostReference(
                        cashBoxId.Value,
                        "In",
                        paid,
                        null,
                        "SalesInvoice",
                        invoice.Id,
                        $"فاتورة مبيعات {invoice.InvoiceNumber} — {invoice.ClientName}",
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
            var invoice = await _context.SalesInvoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);
            if (invoice == null) return false;

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var line in invoice.Items)
                {
                    var product = await _context.Products.FindAsync(line.ProductId);
                    if (product != null)
                    {
                        product.Quantity += (int)Math.Round(line.Quantity);
                        product.UpdatedAt = DateTime.Now;
                    }
                }

                _context.SalesInvoices.Remove(invoice);
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
            var prefix = $"SI-{year}-";
            var last = await _context.SalesInvoices
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

        private static SalesInvoiceDetailDto MapDetail(SalesInvoice i) => new()
        {
            Id = i.Id,
            InvoiceNumber = i.InvoiceNumber,
            ClientId = i.ClientId,
            ClientName = i.ClientName,
            ClientPhone = i.ClientPhone,
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
            Items = i.Items?.Select(x => new SalesInvoiceItemDetailDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                ProductCode = x.ProductCode,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                LineTotal = x.LineTotal
            }).ToList() ?? new List<SalesInvoiceItemDetailDto>()
        };
    }
}
