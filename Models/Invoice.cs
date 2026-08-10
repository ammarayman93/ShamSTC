using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
	public class Invoice
	{
		public int Id { get; set; }
		public string InvoiceNumber { get; set; }
		public int ClientId { get; set; }  // »œ·« „‰ CustomerName
		public int? SubscriptionId { get; set; }
		public decimal SubTotal { get; set; }
		public decimal Tax { get; set; }
		public decimal Discount { get; set; }
		public decimal Total { get; set; }
		public DateTime Date { get; set; }
		public DateTime DueDate { get; set; }
		public bool IsPaid { get; set; }
		public DateTime? PaidAt { get; set; }
		public string Status { get; set; } = "Pending";
		public string Notes { get; set; }

		// Navigation properties
		public Client Client { get; set; }
		public Subscription Subscription { get; set; }
		public ICollection<InvoiceItem> Items { get; set; }

		public bool IsOverdue => !IsPaid && DueDate < DateTime.Now;
		public int DaysOverdue => IsOverdue ? (DateTime.Now - DueDate).Days : 0;
	}
}