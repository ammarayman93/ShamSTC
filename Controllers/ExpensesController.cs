using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Models;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;
        private readonly CashBoxService _cashBoxes;

        public ExpensesController(AppDbContext context, AuditService audit, CashBoxService cashBoxes)
        {
            _context = context;
            _audit = audit;
            _cashBoxes = cashBoxes;
        }

        private int? UserId
        {
            get
            {
                var v = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(v, out var id) ? id : null;
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var total = await _context.Expenses.CountAsync();
            var data = await _context.Expenses
                .Include(e => e.CashBox)
                .Include(e => e.Account)
                .OrderByDescending(e => e.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new
                {
                    e.Id,
                    e.Amount,
                    e.Reason,
                    e.Category,
                    e.Date,
                    e.ReferenceNumber,
                    e.Notes,
                    e.CashBoxId,
                    CashBoxName = e.CashBox != null ? e.CashBox.Name : null,
                    e.AccountId,
                    AccountName = e.Account != null ? e.Account.Name : null
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new { data, total, page, pageSize }));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Employee")]
        public async Task<IActionResult> Add([FromBody] CreateExpenseDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات المصروف غير صالحة"));

            try
            {
                int? cashBoxId = dto.CashBoxId;
                if (cashBoxId == null)
                {
                    var expBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "EXP" && c.IsActive);
                    cashBoxId = expBox?.Id;
                }

                var expense = new Expense
                {
                    Amount = dto.Amount,
                    Reason = dto.Reason,
                    Category = dto.Category,
                    ReferenceNumber = dto.ReferenceNumber,
                    Notes = dto.Notes,
                    Date = DateTime.Now,
                    CreatedAt = DateTime.Now,
                    CreatedBy = UserId,
                    CashBoxId = cashBoxId,
                    AccountId = dto.AccountId
                };

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();

                // خصم من صندوق المصاريف
                if (cashBoxId.HasValue)
                {
                    await _cashBoxes.PostReference(
                        cashBoxId.Value,
                        "Out",
                        dto.Amount,
                        dto.AccountId,
                        "Expense",
                        expense.Id,
                        $"مصروف: {dto.Reason} ({dto.Category})",
                        UserId);
                }

                await _audit.Log("Create", "Expense", expense.Id);
                return Ok(ApiResponse<object>.Ok(expense, "تم تسجيل المصروف وخصمه من الصندوق"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateExpenseDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة فارغة"));

            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return NotFound(ApiResponse<string>.Fail("المصروف المطلوب غير موجود"));

            // ملاحظة: تعديل المبلغ لا يعكس حركة الصندوق تلقائياً — يُفضّل حذف وإعادة إدخال
            expense.Amount = dto.Amount;
            expense.Reason = dto.Reason;
            expense.Category = dto.Category;

            await _context.SaveChangesAsync();
            await _audit.Log("Update", "Expense", id);
            return Ok(ApiResponse<object>.Ok(expense));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Delete(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return NotFound(ApiResponse<string>.Fail("غير موجود"));

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            await _audit.Log("Delete", "Expense", id);
            return Ok(ApiResponse<string>.Ok("تم الحذف"));
        }
    }
}
