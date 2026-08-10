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
            _logger.LogInformation("🚀 ExpirationService بدأ العمل");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var radius = scope.ServiceProvider.GetRequiredService<RadiusService>();
                    var mikroTik = scope.ServiceProvider.GetService<MikroTikService>();

                    // الاشتراكات المنتهية وما زالت Active
                    var expiredSubs = await db.Subscriptions
                        .Include(s => s.Client)
                        .Where(x => x.EndDate < DateTime.Now && x.IsActive)
                        .ToListAsync(stoppingToken);

                    if (expiredSubs.Any())
                    {
                        _logger.LogInformation("⏰ تم العثور على {Count} اشتراك منتهٍ", expiredSubs.Count);

                        foreach (var sub in expiredSubs)
                        {
                            sub.IsActive = false;
                            sub.Status = "Expired";

                            if (sub.Client != null)
                            {
                                // تعطيل في RADIUS
                                var disabled = await radius.DisableUser(sub.Client.Username);
                                await radius.DisconnectUser(sub.Client.Username);

                                // فصل الجلسة على المايكروتيك فوراً
                                if (mikroTik != null)
                                {
                                    try { await mikroTik.KickActiveUser(sub.Client.Username); }
                                    catch (Exception kex) {
                                        _logger.LogWarning(kex, "فشل فصل جلسة MikroTik لـ {User}", sub.Client.Username);
                                    }
                                }

                                // تحديث حالة العميل إذا لم يعد لديه اشتراك نشط
                                var stillHasActive = await db.Subscriptions
                                    .AnyAsync(s => s.ClientId == sub.ClientId
                                                && s.IsActive
                                                && s.EndDate > DateTime.Now, stoppingToken);

                                if (!stillHasActive)
                                {
                                    sub.Client.Status = "Expired";
                                }

                                _logger.LogInformation(
                                    "⛔ تم تعطيل العميل {Username} في RADIUS (نتيجة: {Result})",
                                    sub.Client.Username, disabled);
                            }
                        }

                        await db.SaveChangesAsync(stoppingToken);
                    }

                    // تنبيه الاشتراكات القريبة من الانتهاء (خلال 3 أيام)
                    var expiringSoon = await db.Subscriptions
                        .Include(s => s.Client)
                        .Where(x => x.IsActive
                                 && x.EndDate > DateTime.Now
                                 && x.EndDate <= DateTime.Now.AddDays(3))
                        .ToListAsync(stoppingToken);

                    foreach (var sub in expiringSoon)
                    {
                        _logger.LogWarning(
                            "⚠️ الاشتراك للعميل {Username} ينتهي خلال {Days} أيام",
                            sub.Client?.Username,
                            (sub.EndDate - DateTime.Now).Days);
                        // هنا يمكن إضافة إشعار لاحقاً
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ خطأ في ExpirationService");
                }

                // الانتظار 15 دقيقة بدلاً من 30 (أسرع استجابة)
                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }
    }
}