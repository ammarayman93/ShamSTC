using System;

namespace ISPSystem.Models
{
    public class Purchase
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }

        public string ProductName { get; set; }
        public string ModelNumber { get; set; }

        public int Quantity { get; set; }
        public decimal CostPerUnit { get; set; }
        public decimal Total { get; set; }

        public string Supplier { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public string Notes { get; set; }
        public int? CreatedBy { get; set; }
    }
}