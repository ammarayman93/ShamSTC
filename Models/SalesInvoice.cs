using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    public class SalesInvoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; }

        public int? ClientId { get; set; }
        public Client Client { get; set; }
        public string ClientName { get; set; }
        public string ClientPhone { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }

        /// <summary>Paid | Partial | Unpaid</summary>
        public string PaymentStatus { get; set; } = "Paid";
        public decimal PaidAmount { get; set; }

        /// <summary>افتراضي: صندوق المبيعات SALES</summary>
        public int? CashBoxId { get; set; }
        public CashBox CashBox { get; set; }

        public string Notes { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<SalesInvoiceItem> Items { get; set; }
    }

    public class SalesInvoiceItem
    {
        public int Id { get; set; }
        public int SalesInvoiceId { get; set; }
        public SalesInvoice SalesInvoice { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        public string ProductName { get; set; }
        public string ProductCode { get; set; }

        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }
}
