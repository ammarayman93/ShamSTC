// backend/Models/RadiusUser.cs
#nullable enable
using System;

namespace ISPSystem.Models
{
    public class RadiusUser
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Profile { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public long DataUsed { get; set; }
        public int? ClientId { get; set; }
        public Client? Client { get; set; }
    }

    public class RadiusSession
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string? NasIp { get; set; }
        public int NasPort { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = "Active";
        public long DataIn { get; set; }
        public long DataOut { get; set; }
        public string? IpAddress { get; set; }
        public string? CallingStationId { get; set; }
        public string? FramedIpAddress { get; set; }
    }
}