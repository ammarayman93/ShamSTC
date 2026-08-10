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
    public class AccountService
    {
        private readonly AppDbContext _context;

        public AccountService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AccountTreeDto>> GetTree()
        {
            var all = await _context.Accounts
                .OrderBy(a => a.SortOrder)
                .ThenBy(a => a.Code)
                .ToListAsync();

            return BuildTree(all, null);
        }

        public async Task<List<Account>> GetAllFlat()
        {
            return await _context.Accounts
                .OrderBy(a => a.SortOrder)
                .ThenBy(a => a.Code)
                .ToListAsync();
        }

        public async Task<List<Account>> GetPostable(string type = null)
        {
            var q = _context.Accounts.Where(a => a.IsActive && a.IsPostable);
            if (!string.IsNullOrWhiteSpace(type))
                q = q.Where(a => a.Type == type);
            return await q.OrderBy(a => a.Code).ToListAsync();
        }

        public async Task<Account> GetById(int id)
        {
            return await _context.Accounts.FindAsync(id);
        }

        public async Task<Account> Create(CreateAccountDto dto)
        {
            if (await _context.Accounts.AnyAsync(a => a.Code == dto.Code))
                throw new Exception("رمز الحساب موجود مسبقاً");

            int level = 1;
            if (dto.ParentId.HasValue)
            {
                var parent = await _context.Accounts.FindAsync(dto.ParentId.Value);
                if (parent == null)
                    throw new Exception("الحساب الأب غير موجود");
                level = parent.Level + 1;
            }

            var account = new Account
            {
                Code = dto.Code.Trim(),
                Name = dto.Name.Trim(),
                Type = dto.Type,
                ParentId = dto.ParentId,
                IsPostable = dto.IsPostable,
                OpeningBalance = dto.OpeningBalance,
                Level = level,
                SortOrder = dto.SortOrder,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<Account> Update(int id, UpdateAccountDto dto)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) return null;

            account.Name = dto.Name.Trim();
            account.IsPostable = dto.IsPostable;
            account.IsActive = dto.IsActive;
            account.OpeningBalance = dto.OpeningBalance;
            account.SortOrder = dto.SortOrder;

            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<bool> Delete(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) return false;

            if (await _context.Accounts.AnyAsync(a => a.ParentId == id))
                throw new Exception("لا يمكن حذف حساب له حسابات فرعية");

            if (await _context.CashBoxes.AnyAsync(c => c.AccountId == id))
                throw new Exception("الحساب مرتبط بصندوق");

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();
            return true;
        }

        private List<AccountTreeDto> BuildTree(List<Account> all, int? parentId)
        {
            return all
                .Where(a => a.ParentId == parentId)
                .Select(a => new AccountTreeDto
                {
                    Id = a.Id,
                    Code = a.Code,
                    Name = a.Name,
                    Type = a.Type,
                    ParentId = a.ParentId,
                    IsPostable = a.IsPostable,
                    IsActive = a.IsActive,
                    OpeningBalance = a.OpeningBalance,
                    Level = a.Level,
                    SortOrder = a.SortOrder,
                    Children = BuildTree(all, a.Id)
                })
                .ToList();
        }
    }
}
