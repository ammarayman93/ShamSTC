using System;

namespace ISPSystem.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public int? SubscriptionId { get; set; }
        public int? InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public string ReferenceNumber { get; set; }
        public string Notes { get; set; }
        public string Status { get; set; } = "Completed";

        /// <summary>صندوق التحصيل — افتراضي صندوق التفعيلات ACT</summary>
        public int? CashBoxId { get; set; }
        public CashBox CashBox { get; set; }

        public Client Client { get; set; }
        public Subscription Subscription { get; set; }
        public Invoice Invoice { get; set; }
    }
}
