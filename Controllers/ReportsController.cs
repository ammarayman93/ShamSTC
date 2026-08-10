using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.Helpers;
using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize(Roles = "Admin,Accountant")] // 🔐 تقييد الوصول للتقارير الحساسة فقط للمسؤولين والمحاسبين
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        // 📊 تقرير الاشتراكات وحساب معدلات التجديد
        [HttpGet("subscriptions")]
        public async Task<IActionResult> GetSubscriptionsReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Now.AddMonths(-1);
            var end = endDate ?? DateTime.Now;

            var newSubscriptions = await _context.Subscriptions
                .Where(s => s.StartDate >= start && s.StartDate <= end)
                .CountAsync();

            var expiredSubscriptions = await _context.Subscriptions
                .Where(s => s.EndDate >= start && s.EndDate <= end && !s.IsActive)
                .CountAsync();

            var activeSubscriptions = await _context.Subscriptions
                .Where(s => s.IsActive && s.EndDate > DateTime.Now)
                .CountAsync();

            var byPlan = await _context.Subscriptions
                .Where(s => s.StartDate >= start && s.StartDate <= end)
                .GroupBy(s => s.Plan.Name)
                .Select(g => new
                {
                    Plan = g.Key,
                    Count = g.Count(),
                    Revenue = g.Sum(s => s.PaidAmount)
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                Period = new { Start = start, End = end },
                Summary = new
                {
                    NewSubscriptions = newSubscriptions,
                    ExpiredSubscriptions = expiredSubscriptions,
                    ActiveSubscriptions = activeSubscriptions,
                    RenewalRate = (newSubscriptions + expiredSubscriptions) > 0
                        ? (double)newSubscriptions / (newSubscriptions + expiredSubscriptions) * 100
                        : 0
                },
                ByPlan = byPlan
            }));
        }

        // 👥 تقرير العملاء ونسب النشاط اللحظية
        [HttpGet("clients")]
        public async Task<IActionResult> GetClientsReport()
        {
            var totalClients = await _context.Clients.CountAsync();

            var activeClients = await _context.Subscriptions
                .Where(s => s.IsActive && s.EndDate > DateTime.Now)
                .Select(s => s.ClientId)
                .Distinct()
                .CountAsync();

            // ⚡ تحسين كفاءة الاستعلام عبر النطاقات بدلاً من دالات Month/Year التي تكسر الـ Indexing
            var firstDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var firstDayOfNextMonth = firstDayOfMonth.AddMonths(1);

            var newClientsThisMonth = await _context.Clients
                .CountAsync(c => c.CreatedAt >= firstDayOfMonth && c.CreatedAt < firstDayOfNextMonth);

            var clientsByStatus = await _context.Clients
                .GroupBy(c => c.Status)
                .Select(g => new
                {
                    Status = g.Key == "Active" ? "نشط" : "غير نشط",
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                TotalClients = totalClients,
                ActiveClients = activeClients,
                InactiveClients = totalClients - activeClients,
                NewClientsThisMonth = newClientsThisMonth,
                ByStatus = clientsByStatus
            }));
        }

        // 👥 تقرير توزيع الموظفين والأدوار داخل الـ ISP
        [HttpGet("employees")]
        [Authorize(Roles = "Admin")] // متاح فقط للمدير التنفيذي
        public async Task<IActionResult> GetEmployeesReport()
        {
            var totalEmployees = await _context.Users.CountAsync();

            var employeesByRole = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new
                {
                    Role = g.Key,
                    Count = g.Count(),
                    ActiveCount = g.Count(u => u.Status == "Active")
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                TotalEmployees = totalEmployees,
                ByRole = employeesByRole
            }));
        }

        // 📦 تقرير المبيعات وحالة مخزون المعدات (مثل الراوترات والكابلات)
        [HttpGet("products")]
        public async Task<IActionResult> GetProductsReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Now.AddMonths(-1);
            var end = endDate ?? DateTime.Now;

            // 🛠️ إصلاح ثغرة الـ GroupBy: التجميع بناءً على الـ ID والاسم معاً لتفادي دالة First() المكسورة بـ EF Core
            var topProducts = await _context.Sales
                .Where(s => s.Date >= start && s.Date <= end)
                .GroupBy(s => new { s.ProductId, s.Product.Name })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    QuantitySold = g.Sum(s => s.Quantity),
                    TotalRevenue = g.Sum(s => s.Total)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(10)
                .ToListAsync();

            var lowStockProducts = await _context.Products
                .Where(p => p.Quantity <= 10)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Quantity,
                    p.SellPrice
                })
                .ToListAsync();

            var totalStockValue = await _context.Products.SumAsync(p => p.Quantity * p.CostPrice);

            return Ok(ApiResponse<object>.Ok(new
            {
                Period = new { Start = start, End = end },
                TopProducts = topProducts,
                LowStockProducts = lowStockProducts,
                TotalStockValue = totalStockValue
            }));
        }

        // 💵 تصدير التقرير المالي إلى Excel / CSV مع دعم كامل ومضمون للغة العربية
        [HttpGet("export/financial")]
        public async Task<IActionResult> ExportFinancialReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Now.AddMonths(-1);
            var end = endDate ?? DateTime.Now;

            var payments = await _context.Payments
                .Include(p => p.Client)
                .Where(p => p.Date >= start && p.Date <= end && p.Status == "Completed")
                .OrderBy(p => p.Date)
                .ToListAsync();

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("التاريخ,اسم العميل,المبلغ,طريقة الدفع,الرقم المرجعي");

            foreach (var p in payments)
            {
                // تنظيف الاسم من الفواصل لمنع تكسر حقول ملف الـ CSV
                var safeName = p.Client?.FullName?.Replace(",", " ") ?? "عميل غير معروف";
                csvBuilder.AppendLine($"{p.Date:yyyy-MM-dd},{safeName},{p.Amount},{p.PaymentMethod},{p.ReferenceNumber}");
            }

            // 💡 حقن الـ UTF-8 BOM (0xEF, 0xBB, 0xBF) ليتعرف Excel على الحروف العربية مباشرة دون تشويه
            var csvBytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            var bom = new byte[] { 0xEF, 0xBB, 0xBF };
            var finalFileBytes = bom.Concat(csvBytes).ToArray();

            return File(finalFileBytes, "text/csv; charset=utf-8", $"financial_report_{start:yyyyMMdd}_{end:yyyyMMdd}.csv");
        }
    }
}