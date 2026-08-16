using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ISPSystem.Data;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    /// <summary>
    /// يفصل العملاء عند انتهاء الاشتراك.
    /// EndDate مضبوط على الساعة 12:00 ظهراً.
    /// يستخدم MikroTikServerId الخاص بالعميل لفصل الجلسة من الراوتر الصحيح.
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
            _logger.LogInformation("🚀 ExpirationService بدأ العمل (فصل عند الساعة 12 ظهراً حسب EndDate + multi MikroTik)");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var radius = scope.ServiceProvider.GetRequiredService<RadiusService>();
                    var mikroTik = scope.ServiceProvider.GetService<MikroTikService>();

                    var now = DateTime.Now;

                    var expiredSubs = await db.Subscriptions
                        .Include(s => s.Client)
                        .Where(x => x.EndDate <= now && x.IsActive)
                        .ToListAsync(stoppingToken);

                    if (expiredSubs.Any())
                    {
                        _logger.LogInformation(
                            "⏰ تم العثور على {Count} اشتراك منتهٍ",
                            expiredSubs.Count);

                        foreach (var sub in expiredSubs)
                        {
                            sub.IsActive = false;
                            sub.Status = "Expired";

                            if (sub.Client == null)
                                continue;

                            var username = sub.Client.Username;
                            var disabled = await radius.DisableUser(username);
                            await radius.DisconnectUser(username);

                            if (mikroTik != null)
                            {
                                try
                                {
                                    await KickOnClientRouter(mikroTik, db, sub.Client);
                                }
                                catch (Exception kex)
                                {
                                    _logger.LogWarning(
                                        kex,
                                        "فشل فصل جلسة MikroTik لـ {User} (ServerId={Sid})",
                                        username,
                                        sub.Client.MikroTikServerId);
                                }
                            }

                            var stillHasActive = await db.Subscriptions
                                .AnyAsync(s => s.ClientId == sub.ClientId
                                            && s.IsActive
                                            && s.EndDate > now, stoppingToken);

                            if (!stillHasActive)
                                sub.Client.Status = "Expired";

                            _logger.LogInformation(
                                "⛔ تعطيل {Username} عند انتهاء الاشتراك ({End:yyyy-MM-dd HH:mm}) RADIUS={Result} MT={Sid}",
                                username,
                                sub.EndDate,
                                disabled,
                                sub.Client.MikroTikServerId);
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

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        /// <summary>
        /// فصل الجلسة من الراوتر المرتبط بالعميل، أو الافتراضي إن لم يُحدد.
        /// </summary>
        private static async Task KickOnClientRouter(
            MikroTikService mikroTik,
            AppDbContext db,
            Client client)
        {
            if (client.MikroTikServerId.HasValue && client.MikroTikServerId.Value > 0)
            {
                await mikroTik.KickActiveUserByDeviceId(
                    client.Username,
                    client.MikroTikServerId.Value);
                return;
            }

            // بدون ServerId: جرب الجهاز الافتراضي
            await mikroTik.KickActiveUser(client.Username);
        }
    }
}
