using System;

namespace ISPSystem.Models
{
    public class Sale
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        // للعرض السريع (بدون join)
        public string ProductName { get; set; }
        public string ModelNumber { get; set; }
        public string SerialNumber { get; set; }

        public int Quantity { get; set; }
        public decimal UnitSellPrice { get; set; }
        public decimal Total { get; set; }

        public int? ClientId { get; set; }
        public Client Client { get; set; }
        public string ClientName { get; set; }   // للعرض السريع

        public DateTime Date { get; set; } = DateTime.Now;
        public string Notes { get; set; }

        public int? CreatedBy { get; set; }
    }
}