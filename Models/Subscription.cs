using System;

namespace ISPSystem.Models
{
    public class Subscription
    {
        public int Id { get; set; }
        public int ClientId { get; set; }  // بدلاً من UserId
        public int PlanId { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime? RenewedAt { get; set; }

        // Navigation properties
        public Client Client { get; set; }
        public Plan Plan { get; set; }

        // حساب الأيام المتبقية
        public int DaysRemaining => (EndDate - DateTime.Now).Days;
        public bool IsExpiringSoon => DaysRemaining <= 3 && DaysRemaining > 0;
        public bool IsExpired => EndDate < DateTime.Now;
    }
}