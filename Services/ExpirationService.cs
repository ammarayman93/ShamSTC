using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ISPSystem.Data;
using ISPSystem.Services;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    /// <summary>
    /// يفصل العملاء عند انتهاء الاشتراك.
    /// EndDate مضبوط على الساعة 12:00 ظهراً، فيُفصل العميل عند الظهر في يوم الانتهاء.
    /// </summary>
    public class ExpirationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ExpirationService> _logger;

        public ExpirationService(IServiceScopeFactory scopeFactory, ILogger<ExpirationService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 ExpirationService بدأ العمل (فصل عند الساعة 12 ظهراً حسب EndDate)");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var radius = scope.ServiceProvider.GetRequiredService<RadiusService>();
                    var mikroTik = scope.ServiceProvider.GetService<MikroTikService>();

                    var now = DateTime.Now;

                    // الاشتراكات المنتهية (EndDate = يوم الانتهاء 12:00 ظهراً)
                    var expiredSubs = await db.Subscriptions
                        .Include(s => s.Client)
                        .Where(x => x.EndDate <= now && x.IsActive)
                        .ToListAsync(stoppingToken);

                    if (expiredSubs.Any())
                    {
                        _logger.LogInformation("⏰ تم العثور على {Count} اشتراك منتهٍ (بعد الظهر أو تجاوز التاريخ)", expiredSubs.Count);

                        foreach (var sub in expiredSubs)
                        {
                            sub.IsActive = false;
                            sub.Status = "Expired";

                            if (sub.Client != null)
                            {
                                var disabled = await radius.DisableUser(sub.Client.Username);
                                await radius.DisconnectUser(sub.Client.Username);

                                if (mikroTik != null)
                                {
                                    try { await mikroTik.KickActiveUser(sub.Client.Username); }
                                    catch (Exception kex)
                                    {
                                        _logger.LogWarning(kex, "فشل فصل جلسة MikroTik لـ {User}", sub.Client.Username);
                                    }
                                }

                                var stillHasActive = await db.Subscriptions
                                    .AnyAsync(s => s.ClientId == sub.ClientId
                                                && s.IsActive
                                                && s.EndDate > now, stoppingToken);

                                if (!stillHasActive)
                                {
                                    sub.Client.Status = "Expired";
                                }

                                _logger.LogInformation(
                                    "⛔ تم تعطيل العميل {Username} في RADIUS عند انتهاء الاشتراك ({End:yyyy-MM-dd HH:mm}) (نتيجة: {Result})",
                                    sub.Client.Username, sub.EndDate, disabled);
                            }
                        }

                        await db.SaveChangesAsync(stoppingToken);
                    }

                    var expiringSoon = await db.Subscriptions
                        .Include(s => s.Client)
                        .Where(x => x.IsActive
                                 && x.EndDate > now
                                 && x.EndDate <= now.AddDays(3))
                        .ToListAsync(stoppingToken);

                    foreach (var sub in expiringSoon)
                    {
                        _logger.LogWarning(
                            "⚠️ الاشتراك للعميل {Username} ينتهي في {End:yyyy-MM-dd HH:mm} (خلال {Days} أيام)",
                            sub.Client?.Username,
                            sub.EndDate,
                            (sub.EndDate - now).Days);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ خطأ في ExpirationService");
                }

                // كل 5 دقائق لاستجابة أدق حول الساعة 12
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
