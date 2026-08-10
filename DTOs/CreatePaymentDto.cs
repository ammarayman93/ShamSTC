namespace ISPSystem.DTOs
{
    public class CreatePaymentDto
    {
        public int ClientId { get; set; }
        public decimal Amount { get; set; }
        public int? SubscriptionId { get; set; }
        public int? InvoiceId { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public string ReferenceNumber { get; set; }
        public string Notes { get; set; }
        public int? CashBoxId { get; set; }
    }
}