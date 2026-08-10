using System;
using System.Collections.Generic;

namespace ISPSystem.Models   // ÛíøÑ ÇáÜ namespace ÍÓÈ ãßÇä Çáãáİ ÚäÏß
{
    public class OnlineSessionInfo
    {
        public string Username { get; set; } = string.Empty;
        public string FramedIp { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
        public DateTime? StartTime { get; set; }
        public string NasIp { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;

        // ÇÎÊíÇÑí — áæ ÊÍÊÇÌåã áÇÍŞÇğ
        public long? SessionTime { get; set; }
        public long? InputOctets { get; set; }
        public long? OutputOctets { get; set; }
    }
}