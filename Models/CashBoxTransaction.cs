using System;

namespace ISPSystem.Models
{
    /// <summary>
    /// حركة على صندوق (وارد / صادر)
    /// </summary>
    public class CashBoxTransaction
    {
        public int Id { get; set; }

        public int CashBoxId { get; set; }
        public CashBox CashBox { get; set; }

        /// <summary>In = وارد | Out = صادر</summary>
        public string Direction { get; set; }

        public decimal Amount { get; set; }

        /// <summary>رصيد الصندوق بعد الحركة</summary>
        public decimal BalanceAfter { get; set; }

        public int? AccountId { get; set; }
        public Account Account { get; set; }

        /// <summary>PurchaseInvoice, SalesInvoice, Expense, Payment, Manual...</summary>
        public string ReferenceType { get; set; }

        public int? ReferenceId { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public string Notes { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
