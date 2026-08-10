using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    /// <summary>
    /// صندوق نقدي/بنكي
    /// Codes: ACT | SALES | EXP | PUR | BANK | CASH
    /// </summary>
    public class CashBox
    {
        public int Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        /// <summary>ربط اختياري بحساب في دليل الحسابات (نقدية)</summary>
        public int? AccountId { get; set; }
        public Account Account { get; set; }

        public decimal Balance { get; set; }

        public bool IsActive { get; set; } = true;

        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<CashBoxTransaction> Transactions { get; set; }
    }
}
