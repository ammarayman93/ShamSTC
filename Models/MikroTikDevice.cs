using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    /// <summary>
    /// سيرفر MikroTik في فرع/منطقة — يُدار مركزياً عبر VPN
    /// (L2TP أو WireGuard أو اتصال مباشر).
    ///
    /// IpAddress / VpnIp = عنوان الوصول للـ API بعد إنشاء نفق VPN
    /// مثال بعد اتصال L2TP: 10.50.0.2
    /// </summary>
    public class MikroTikDevice
    {
        public int Id { get; set; }

        /// <summary>اسم الجهاز: Damascus-MT-02</summary>
        public string Name { get; set; }

        /// <summary>المنطقة/المدينة: Damascus, Daraa, Homs, Aleppo</summary>
        public string Region { get; set; }

        /// <summary>
        /// عنوان الاتصال بالـ API (يفضّل IP داخل النفق مثل 10.50.0.2)
        /// </summary>
        public string IpAddress { get; set; }

        /// <summary>IP عام للراوتر إن وُجد (اختياري)</summary>
        public string PublicIp { get; set; }

        /// <summary>
        /// IP داخل نفق VPN (L2TP/WireGuard).
        /// إن وُجد يُستخدم للاتصال بالـ API بدل IpAddress.
        /// </summary>
        public string VpnIp { get; set; }

        /// <summary>نوع الاتصال: L2TP | WireGuard | Direct</summary>
        public string ConnectionType { get; set; } = "L2TP";

        public string Username { get; set; }
        public string Password { get; set; }
        public int ApiPort { get; set; } = 8728;

        /// <summary>Secret الخاص بهذا الراوتر في FreeRADIUS clients.conf</summary>
        public string RadiusSecret { get; set; }

        public bool IsEnabled { get; set; } = true;
        public bool IsOnline { get; set; } = false;

        /// <summary>Online | Offline | Unknown</summary>
        public string Status { get; set; } = "Unknown";

        public DateTime? LastCheckedAt { get; set; }
        public string LastError { get; set; }
        public string Location { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Client> Clients { get; set; }
    }
}
