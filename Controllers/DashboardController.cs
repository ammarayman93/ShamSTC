using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.Helpers;
using ISPSystem.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly MikroTikService _mikroTik;
        private readonly RadiusService _radius;

        public DashboardController(AppDbContext context, MikroTikService mikroTik, RadiusService radius)
        {
            _context = context;
            _mikroTik = mikroTik;
            _radius = radius;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var now = DateTime.Now;
                var today = now.Date;
                var threeDaysFromNow = today.AddDays(3);

                // 1. عدد المتصلين: دمج MikroTik + radacct
                var onlineClients = 0;
                var onlineNames = new System.Collections.Generic.HashSet<string>(System.StringComparer.OrdinalIgnoreCase);
                try
                {
                    var online = await _mikroTik.GetActiveUsers();
                    if (online != null)
                    {
                        foreach (var u in online)
                            if (!string.IsNullOrEmpty(u.Name))
                                onlineNames.Add(u.Name);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"MikroTik Connection Error: {ex.Message}");
                }
                try
                {
                    var radOnline = await _radius.GetOnlineUsers();
                    foreach (var k in radOnline.Keys)
                        onlineNames.Add(k);
                }
                catch { }
                onlineClients = onlineNames.Count;

                // 2. إحصائيات العملاء
                var totalClients = await _context.Clients.CountAsync();

                var activeClients = await _context.Subscriptions
                    .Where(s => s.IsActive && s.EndDate > now)
                    .Select(s => s.ClientId)
                    .Distinct()
                    .CountAsync();

                var expiringToday = await _context.Subscriptions
                    .CountAsync(s => s.IsActive && s.EndDate >= today && s.EndDate < today.AddDays(1));

                var expiringSoon = await _context.Subscriptions
                    .CountAsync(s => s.IsActive && s.EndDate > now && s.EndDate <= threeDaysFromNow);

                var expiredClients = await _context.Subscriptions
                    .CountAsync(s => !s.IsActive && s.EndDate < now);

                // 3. الباقات
                var plansStats = await _context.Plans
                    .Select(p => new PlanStatDto
                    {
                        Name = p.Name,
                        Count = p.Subscriptions.Count(s => s.IsActive)
                    })
                    .Where(x => x.Count > 0)
                    .ToListAsync();

                // 4. المالية
                var todayRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" && p.Date >= today && p.Date < today.AddDays(1))
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                var monthRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" && p.Date.Month == now.Month && p.Date.Year == now.Year)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                var monthExpenses = await _context.Expenses
                    .Where(e => e.Date.Month == now.Month && e.Date.Year == now.Year)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0;

                // 5. الفواتير
                var pendingInvoices = await _context.Invoices
                    .CountAsync(i => !i.IsPaid && i.DueDate >= now);

                var overdueInvoices = await _context.Invoices
                    .CountAsync(i => !i.IsPaid && i.DueDate < now);

                var overdueAmount = await _context.Invoices
                    .Where(i => !i.IsPaid && i.DueDate < now)
                    .SumAsync(i => (decimal?)i.Total) ?? 0;

                // 6. قوائم
                var expiredList = await _context.Subscriptions
                    .Include(s => s.Client)
                    .Include(s => s.Plan)
                    .Where(s => !s.IsActive && s.EndDate < now)
                    .OrderByDescending(s => s.EndDate)
                    .Take(5)
                    .Select(s => new ExpiredClientDto
                    {
                        FullName = s.Client != null ? s.Client.FullName : "",
                        Username = s.Client != null ? s.Client.Username : "",
                        Phone = s.Client != null ? s.Client.Phone : "",
                        PlanName = s.Plan != null ? s.Plan.Name : "",
                        EndDate = s.EndDate
                    })
                    .ToListAsync();

                var expiringRaw = await _context.Subscriptions
                    .Include(s => s.Client)
                    .Include(s => s.Plan)
                    .Where(s => s.IsActive && s.EndDate > now && s.EndDate <= threeDaysFromNow)
                    .OrderBy(s => s.EndDate)
                    .Take(5)
                    .Select(s => new
                    {
                        FullName = s.Client != null ? s.Client.FullName : "",
                        Username = s.Client != null ? s.Client.Username : "",
                        Phone = s.Client != null ? s.Client.Phone : "",
                        PlanName = s.Plan != null ? s.Plan.Name : "",
                        EndDate = s.EndDate
                    })
                    .ToListAsync();

                // حساب الأيام المتبقية في الذاكرة (EF لا يترجم DateTime - DateTime بشكل موثوق)
                var expiringList = expiringRaw.Select(s => new ExpiringClientDto
                {
                    FullName = s.FullName,
                    Username = s.Username,
                    Phone = s.Phone,
                    PlanName = s.PlanName,
                    EndDate = s.EndDate,
                    DaysRemaining = (int)Math.Ceiling((s.EndDate - now).TotalDays)
                }).ToList();

                return Ok(ApiResponse<object>.Ok(new
                {
                    clients = new
                    {
                        total = totalClients,
                        active = activeClients,
                        online = onlineClients,
                        expiringToday,
                        expiringSoon,
                        expired = expiredClients
                    },
                    plans = plansStats,
                    financial = new
                    {
                        todayRevenue,
                        monthRevenue,
                        monthExpenses,
                        monthProfit = monthRevenue - monthExpenses,
                        pendingInvoices,
                        overdueInvoices,
                        overdueAmount
                    },
                    recent = new
                    {
                        expiredClientsList = expiredList,
                        expiringSoonList = expiringList
                    }
                }));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Dashboard Error: {ex.Message}");
                return StatusCode(500, ApiResponse<string>.Fail($"Dashboard error: {ex.Message}"));
            }
        }

        // 📈 الحصول على الإحصائيات العامة والنسب المئوية للتحويل المالي
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalRevenue = await _context.Payments
                .Where(p => p.Status == "Completed")
                .SumAsync(p => p.Amount);

            var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);
            var totalSubscriptions = await _context.Subscriptions.CountAsync();
            var activeSubscriptions = await _context.Subscriptions.CountAsync(s => s.IsActive);

            return Ok(ApiResponse<object>.Ok(new
            {
                totalRevenue,
                totalExpenses,
                totalProfit = totalRevenue - totalExpenses,
                totalSubscriptions,
                activeSubscriptions,
                conversionRate = totalSubscriptions > 0 ? (double)activeSubscriptions / totalSubscriptions * 100 : 0
            }));
        }

        // 🔔 جلب تنبيهات لوحة القيادة الفورية (الاشتراكات، الفواتير، النواقص)
        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var now = DateTime.Now;
            var threeDaysFromNow = now.AddDays(3);

            var expiringSoon = await _context.Subscriptions
                .CountAsync(s => s.IsActive && s.EndDate <= threeDaysFromNow && s.EndDate > now);

            var overdueInvoices = await _context.Invoices
                .CountAsync(i => !i.IsPaid && i.DueDate < now);

            var lowStockProducts = await _context.Products
                .CountAsync(p => p.Quantity <= 5);

            var notifications = new List<object>();
            var timeStr = now.ToString("HH:mm");

            if (expiringSoon > 0)
            {
                notifications.Add(new
                {
                    id = "expiring-" + now.ToString("yyyyMMdd"),
                    title = "اشتراكات تنتهي قريباً",
                    message = $"{expiringSoon} اشتراك سينتهي خلال 3 أيام",
                    type = "warning",
                    time = timeStr,
                    count = expiringSoon
                });
            }

            if (overdueInvoices > 0)
            {
                notifications.Add(new
                {
                    id = "overdue-" + now.ToString("yyyyMMdd"),
                    title = "فواتير متأخرة",
                    message = $"{overdueInvoices} فاتورة متأخرة الدفع",
                    type = "danger",
                    time = timeStr,
                    count = overdueInvoices
                });
            }

            if (lowStockProducts > 0)
            {
                notifications.Add(new
                {
                    id = "lowstock-" + now.ToString("yyyyMMdd"),
                    title = "مخزون منخفض",
                    message = $"{lowStockProducts} منتج وصل إلى الحد الأدنى للمخزون",
                    type = "info",
                    time = timeStr,
                    count = lowStockProducts
                });
            }

            return Ok(ApiResponse<object>.Ok(notifications));
        }
    }

    // 🗂️ تعاريف الـ DTOs المطلوبة للـ Strongly-Typed Mapping
    public class PlanStatDto
    {
        public string Name { get; set; }
        public int Count { get; set; }
    }

    public class ExpiredClientDto
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Phone { get; set; }
        public string PlanName { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class ExpiringClientDto
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Phone { get; set; }
        public string PlanName { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRemaining { get; set; }
    }
}