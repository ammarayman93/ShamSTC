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
    public class CashBoxService
    {
        private readonly AppDbContext _context;

        public CashBoxService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CashBoxDto>> GetAll()
        {
            return await _context.CashBoxes
                .Include(c => c.Account)
                .OrderBy(c => c.Id)
                .Select(c => new CashBoxDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Name = c.Name,
                    AccountId = c.AccountId,
                    AccountName = c.Account != null ? c.Account.Name : null,
                    Balance = c.Balance,
                    IsActive = c.IsActive,
                    Notes = c.Notes,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<CashBoxDto> GetById(int id)
        {
            var c = await _context.CashBoxes.Include(x => x.Account).FirstOrDefaultAsync(x => x.Id == id);
            if (c == null) return null;
            return Map(c);
        }

        public async Task<CashBox> Create(CreateCashBoxDto dto)
        {
            if (await _context.CashBoxes.AnyAsync(c => c.Code == dto.Code))
                throw new Exception("رمز الصندوق موجود مسبقاً");

            var box = new CashBox
            {
                Code = dto.Code.Trim().ToUpper(),
                Name = dto.Name.Trim(),
                AccountId = dto.AccountId,
                Balance = dto.OpeningBalance,
                Notes = dto.Notes,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.CashBoxes.Add(box);
            await _context.SaveChangesAsync();

            if (dto.OpeningBalance != 0)
            {
                await AddTransactionInternal(box, dto.OpeningBalance > 0 ? "In" : "Out",
                    Math.Abs(dto.OpeningBalance), null, "Opening", null, "رصيد افتتاحي", null);
            }

            return box;
        }

        public async Task<CashBox> Update(int id, UpdateCashBoxDto dto)
        {
            var box = await _context.CashBoxes.FindAsync(id);
            if (box == null) return null;

            box.Name = dto.Name.Trim();
            box.AccountId = dto.AccountId;
            box.IsActive = dto.IsActive;
            box.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return box;
        }

        /// <summary>
        /// حركة يدوية وارد/صادر
        /// </summary>
        public async Task<CashBoxTransaction> ManualMovement(ManualCashMovementDto dto, int? userId)
        {
            var box = await _context.CashBoxes.FindAsync(dto.CashBoxId);
            if (box == null || !box.IsActive)
                throw new Exception("الصندوق غير موجود أو غير نشط");

            var dir = dto.Direction?.Trim();
            if (dir != "In" && dir != "Out")
                throw new Exception("الاتجاه يجب أن يكون In أو Out");

            if (dir == "Out" && box.Balance < dto.Amount)
                throw new Exception("رصيد الصندوق غير كافٍ");

            return await AddTransactionInternal(box, dir, dto.Amount, dto.AccountId,
                "Manual", null, dto.Notes, userId);
        }

        /// <summary>
        /// تحويل بين صندوقين
        /// </summary>
        public async Task Transfer(CashBoxTransferDto dto, int? userId)
        {
            if (dto.FromCashBoxId == dto.ToCashBoxId)
                throw new Exception("لا يمكن التحويل لنفس الصندوق");

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var from = await _context.CashBoxes.FindAsync(dto.FromCashBoxId);
                var to = await _context.CashBoxes.FindAsync(dto.ToCashBoxId);
                if (from == null || to == null)
                    throw new Exception("أحد الصندوقين غير موجود");
                if (!from.IsActive || !to.IsActive)
                    throw new Exception("أحد الصندوقين غير نشط");
                if (from.Balance < dto.Amount)
                    throw new Exception("رصيد صندوق المصدر غير كافٍ");

                await AddTransactionInternal(from, "Out", dto.Amount, null, "Transfer",
                    dto.ToCashBoxId, $"تحويل إلى {to.Name}: {dto.Notes}", userId);
                await AddTransactionInternal(to, "In", dto.Amount, null, "Transfer",
                    dto.FromCashBoxId, $"تحويل من {from.Name}: {dto.Notes}", userId);

                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<List<CashBoxTransactionDto>> GetTransactions(int cashBoxId, int page = 1, int pageSize = 50)
        {
            return await _context.CashBoxTransactions
                .Include(t => t.CashBox)
                .Include(t => t.Account)
                .Where(t => t.CashBoxId == cashBoxId)
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new CashBoxTransactionDto
                {
                    Id = t.Id,
                    CashBoxId = t.CashBoxId,
                    CashBoxName = t.CashBox.Name,
                    Direction = t.Direction,
                    Amount = t.Amount,
                    BalanceAfter = t.BalanceAfter,
                    AccountId = t.AccountId,
                    AccountName = t.Account != null ? t.Account.Name : null,
                    ReferenceType = t.ReferenceType,
                    ReferenceId = t.ReferenceId,
                    Date = t.Date,
                    Notes = t.Notes
                })
                .ToListAsync();
        }

        /// <summary>
        /// يُستدعى من خدمات المشتريات/المبيعات/المصروفات لاحقاً
        /// </summary>
        public async Task<CashBoxTransaction> PostReference(
            int cashBoxId, string direction, decimal amount,
            int? accountId, string referenceType, int? referenceId,
            string notes, int? userId)
        {
            var box = await _context.CashBoxes.FindAsync(cashBoxId);
            if (box == null || !box.IsActive)
                throw new Exception("الصندوق غير موجود أو غير نشط");
            if (direction == "Out" && box.Balance < amount)
                throw new Exception($"رصيد {box.Name} غير كافٍ");

            return await AddTransactionInternal(box, direction, amount, accountId,
                referenceType, referenceId, notes, userId);
        }

        private async Task<CashBoxTransaction> AddTransactionInternal(
            CashBox box, string direction, decimal amount,
            int? accountId, string referenceType, int? referenceId,
            string notes, int? userId)
        {
            if (direction == "In")
                box.Balance += amount;
            else
                box.Balance -= amount;

            var trx = new CashBoxTransaction
            {
                CashBoxId = box.Id,
                Direction = direction,
                Amount = amount,
                BalanceAfter = box.Balance,
                AccountId = accountId,
                ReferenceType = referenceType,
                ReferenceId = referenceId,
                Date = DateTime.Now,
                Notes = notes,
                CreatedBy = userId,
                CreatedAt = DateTime.Now
            };

            _context.CashBoxTransactions.Add(trx);
            await _context.SaveChangesAsync();
            return trx;
        }

        private static CashBoxDto Map(CashBox c) => new CashBoxDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            AccountId = c.AccountId,
            AccountName = c.Account?.Name,
            Balance = c.Balance,
            IsActive = c.IsActive,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt
        };
    }
}
