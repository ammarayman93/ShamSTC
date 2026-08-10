using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    /// <summary>
    /// سيرفر MikroTik في فرع/منطقة — يُدار مركزياً عبر VPN (WireGuard)
    /// IpAddress = عنوان الوصول للـ API (عادة VpnIp مثل 10.50.0.2)
    /// </summary>
    public class MikroTikDevice
    {
        public int Id { get; set; }

        /// <summary>اسم الجهاز: Damascus-MT-02</summary>
        public string Name { get; set; }

        /// <summary>المنطقة/المدينة: Damascus, Daraa, Homs, Aleppo</summary>
        public string Region { get; set; }

        /// <summary>
        /// عنوان الاتصال بالـ API (يفضّل IP داخل WireGuard مثل 10.50.0.2)
        /// </summary>
        public string IpAddress { get; set; }

        /// <summary>IP عام للراوتر إن وُجد (اختياري)</summary>
        public string PublicIp { get; set; }

        /// <summary>نفس IpAddress في معظم الحالات — للتوضيح في الواجهة</summary>
        public string VpnIp { get; set; }

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
