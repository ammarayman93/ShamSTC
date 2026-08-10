using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    /// <summary>
    /// حساب في دليل الحسابات (شجرة المحاسبة)
    /// Type: Asset | Liability | Equity | Revenue | Expense | Cost
    /// </summary>
    public class Account
    {
        public int Id { get; set; }

        /// <summary>رمز الحساب مثل 1 أو 1-1 أو 1-1-1</summary>
        public string Code { get; set; }

        public string Name { get; set; }

        /// <summary>Asset, Liability, Equity, Revenue, Expense, Cost</summary>
        public string Type { get; set; }

        public int? ParentId { get; set; }
        public Account Parent { get; set; }
        public ICollection<Account> Children { get; set; }

        /// <summary>true = يمكن التقييد عليه مباشرة (ورقة في الشجرة)</summary>
        public bool IsPostable { get; set; } = true;

        public bool IsActive { get; set; } = true;

        public decimal OpeningBalance { get; set; }

        public int Level { get; set; } = 1;

        public int SortOrder { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
