using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "Open"; // Open, InProgress, Resolved, Closed
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
        public string Category { get; set; } // Technical, Billing, General, Other
        public int? AssignedTo { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ResolvedAt { get; set; }
        public string Resolution { get; set; }

        // Navigation properties
        public Client Client { get; set; }
        public User AssignedUser { get; set; }
        public ICollection<TicketReply> Replies { get; set; }
    }

    public class TicketReply
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsClient { get; set; }

        public Ticket Ticket { get; set; }
        public User User { get; set; }
    }
}