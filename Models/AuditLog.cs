using System;

namespace ISPSystem.Models
{
    public class AuditLog
    {
        public int Id { get; set; }

        public string Action { get; set; } // Create / Update / Delete

        public string Entity { get; set; } // User / Invoice / Product

        public int EntityId { get; set; }

        public string Username { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public string IPAddress { get; set; }
    }
}