using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using ISPSystem.Services;
using System.Globalization;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/financial")]
    [Authorize]
    public class FinancialController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public FinancialController(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        // 📊 لوحة التحكم المالية المجمعة (تحسين فائق للأداء)
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetFinancialDashboard()
        {
            var now = DateTime.Now;
            var today = now.Date;

            // حساب بدايات الفترات الزمنية بدقة
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + 1);
            var startOfMonth = new DateTime(today.Year, now.Month, 1);
            var startOfYear = new DateTime(today.Year, 1, 1);

            // 1. جلب مجاميع الإيرادات باستعلام واحد أو استعلامات مجمعة متوازية
            var todayRevenue = await _context.Payments
                .Where(p => p.Date.Date == today && p.Status == "Completed")
                .SumAsync(p => p.Amount);

            var weekRevenue = await _context.Payments
                .Where(p => p.Date.Date >= startOfWeek && p.Status == "Completed")
                .SumAsync(p => p.Amount);

            var monthRevenue = await _context.Payments
                .Where(p => p.Date.Date >= startOfMonth && p.Status == "Completed")
                .SumAsync(p => p.Amount);

            var yearRevenue = await _context.Payments
                .Where(p => p.Date.Date >= startOfYear && p.Status == "Completed")
                .SumAsync(p => p.Amount);

            var totalRevenue = await _context.Payments
                .Where(p => p.Status == "Completed")
                .SumAsync(p => p.Amount);

            var totalPaymentsCount = await _context.Payments.CountAsync();

            // 2. مجاميع المصروفات
            var todayExpenses = await _context.Expenses
                .Where(e => e.Date.Date == today)
                .SumAsync(e => e.Amount);

            var monthExpenses = await _context.Expenses
                .Where(e => e.Date.Date >= startOfMonth)
                .SumAsync(e => e.Amount);

            var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);

            // 3. الفواتير وحالاتها المستحقة
            var invoicesStats = await _context.Invoices
                .Select(i => new { i.IsPaid, IsOverdue = !i.IsPaid && i.DueDate < now, i.Total })
                .ToListAsync();

            var totalInvoices = invoicesStats.Count;
            var paidInvoices = invoicesStats.Count(i => i.IsPaid);
            var unpaidInvoices = invoicesStats.Count(i => !i.IsPaid);
            var overdueInvoices = invoicesStats.Count(i => i.IsOverdue);
            var overdueAmount = invoicesStats.Where(i => i.IsOverdue).Sum(i => i.Total);

            // ⚡ 4. حل مشكلة الـ N+1 الكارثية: جلب بيانات السنة الحالية دفعة واحدة إلى الذاكرة للرسم البياني
            var allPaymentsThisYear = await _context.Payments
                .Where(p => p.Date.Year == today.Year && p.Status == "Completed")
                .Select(p => new { p.Date.Month, p.Amount })
                .ToListAsync();

            var allExpensesThisYear = await _context.Expenses
                .Where(e => e.Date.Year == today.Year)
                .Select(e => new { e.Date.Month, e.Amount })
                .ToListAsync();

            var monthlyData = new List<MonthlyRevenueDto>();

            // البناء داخل الذاكرة بدون ضرب قاعدة البيانات في كل لفة
            for (int i = 1; i <= 12; i++)
            {
                var revenue = allPaymentsThisYear.Where(p => p.Month == i).Sum(p => p.Amount);
                var expenses = allExpensesThisYear.Where(e => e.Month == i).Sum(e => e.Amount);

                monthlyData.Add(new MonthlyRevenueDto
                {
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(i),
                    Revenue = revenue,
                    Expenses = expenses,
                    Profit = revenue - expenses
                });
            }

            // 5. المصروفات الموزعة حسب الفئة
            var expensesByCategory = await _context.Expenses
                .GroupBy(e => e.Category)
                .Select(g => new CategoryExpenseDto
                {
                    Category = g.Key,
                    Amount = g.Sum(e => e.Amount),
                    Percentage = totalExpenses > 0 ? (int)((g.Sum(e => e.Amount) / totalExpenses) * 100) : 0
                })
                .ToListAsync();

            var result = new FinancialDashboardDto
            {
                TodayRevenue = todayRevenue,
                WeekRevenue = weekRevenue,
                MonthRevenue = monthRevenue,
                YearRevenue = yearRevenue,
                TotalRevenue = totalRevenue,
                TodayExpenses = todayExpenses,
                MonthExpenses = monthExpenses,
                TotalExpenses = totalExpenses,
                TodayProfit = todayRevenue - todayExpenses,
                MonthProfit = monthRevenue - monthExpenses,
                TotalProfit = totalRevenue - totalExpenses,
                TotalInvoices = totalInvoices,
                PaidInvoices = paidInvoices,
                UnpaidInvoices = unpaidInvoices,
                OverdueInvoices = overdueInvoices,
                OverdueAmount = overdueAmount,
                TotalPayments = totalPaymentsCount,
                AveragePayment = totalRevenue > 0 && totalPaymentsCount > 0 ? totalRevenue / totalPaymentsCount : 0,
                MonthlyRevenue = monthlyData,
                ExpensesByCategory = expensesByCategory
            };

            return Ok(ApiResponse<FinancialDashboardDto>.Ok(result));
        }

        // 📅 توليد كشف الحسابات والتقرير المالي التفصيلي بفترة زمنية محددة
        [HttpGet("report")]
        public async Task<IActionResult> GetFinancialReport(DateTime? startDate, DateTime? endDate)
        {
            var start = startDate ?? DateTime.Now.AddMonths(-1);
            var end = endDate ?? DateTime.Now;

            var payments = await _context.Payments
                .Include(p => p.Client)
                .Where(p => p.Date >= start && p.Date <= end && p.Status == "Completed")
                .OrderByDescending(p => p.Date)
                .ToListAsync();

            var expenses = await _context.Expenses
                .Where(e => e.Date >= start && e.Date <= end)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            var invoices = await _context.Invoices
                .Include(i => i.Client)
                .Where(i => i.Date >= start && i.Date <= end)
                .OrderByDescending(i => i.Date)
                .ToListAsync();

            var report = new
            {
                Period = new { Start = start, End = end },
                Summary = new
                {
                    TotalRevenue = payments.Sum(p => p.Amount),
                    TotalExpenses = expenses.Sum(e => e.Amount),
                    NetProfit = payments.Sum(p => p.Amount) - expenses.Sum(e => e.Amount),
                    TotalInvoices = invoices.Count,
                    PaidInvoices = invoices.Count(i => i.IsPaid),
                    OverdueInvoices = invoices.Count(i => !i.IsPaid && i.DueDate < DateTime.Now)
                },
                Payments = payments.Select(p => new
                {
                    p.Id,
                    ClientName = p.Client != null ? p.Client.FullName : "عميل مجهول",
                    p.Amount,
                    p.Date,
                    p.PaymentMethod,
                    p.ReferenceNumber
                }),
                Expenses = expenses.Select(e => new
                {
                    e.Id,
                    e.Reason,
                    e.Amount,
                    e.Category,
                    e.Date
                }),
                Invoices = invoices.Select(i => new
                {
                    i.Id,
                    i.InvoiceNumber,
                    ClientName = i.Client != null ? i.Client.FullName : "عميل مجهول",
                    i.Total,
                    i.Date,
                    i.DueDate,
                    i.IsPaid,
                    i.Status
                })
            };

            return Ok(ApiResponse<object>.Ok(report));
        }

        // ➕ تسجيل سند صرف/مصروف جديد
        [HttpPost("expense")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> AddExpense([FromBody] CreateExpenseDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات السند غير صالحة"));

            var expense = new Expense
            {
                Amount = dto.Amount,
                Reason = dto.Reason,
                Category = dto.Category,
                Date = DateTime.Now,
                ReferenceNumber = dto.ReferenceNumber,
                Notes = dto.Notes
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            await _audit.Log("Create", "Expense", expense.Id);

            return Ok(ApiResponse<Expense>.Ok(expense));
        }

        // 🔄 تعديل بيانات سند صرف
        [HttpPut("expense/{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] CreateExpenseDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة فارغة"));

            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return NotFound(ApiResponse<string>.Fail("سند الصرف غير موجود"));

            expense.Amount = dto.Amount;
            expense.Reason = dto.Reason;
            expense.Category = dto.Category;
            expense.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            await _audit.Log("Update", "Expense", expense.Id);

            return Ok(ApiResponse<Expense>.Ok(expense));
        }

        // ❌ إلغاء وحذف سند صرف (صلاحية Admin فقط لحماية الميزانية)
        [HttpDelete("expense/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return NotFound(ApiResponse<string>.Fail("سند الصرف غير موجود"));

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            await _audit.Log("Delete", "Expense", id);

            return Ok(ApiResponse<string>.Ok("تم حذف السند وتحديث القيود الحسابية"));
        }

        // 📈 إحصائيات بيانية متقدمة للمصروفات وآخر 30 يوماً
        [HttpGet("expenses/stats")]
        public async Task<IActionResult> GetExpenseStats()
        {
            var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);

            var byCategory = await _context.Expenses
                .GroupBy(e => e.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Amount = g.Sum(e => e.Amount),
                    Count = g.Count(),
                    Percentage = totalExpenses > 0 ? (int)((g.Sum(e => e.Amount) / totalExpenses) * 100) : 0
                })
                .OrderByDescending(x => x.Amount)
                .ToListAsync();

            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            var last30Days = await _context.Expenses
                .Where(e => e.Date >= thirtyDaysAgo)
                .GroupBy(e => e.Date.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Amount = g.Sum(e => e.Amount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                Total = totalExpenses,
                ByCategory = byCategory,
                Last30Days = last30Days
            }));
        }
    }
}