using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    /// <summary>
    /// بطاقة المادة (المخزون) — تطوير Product
    /// </summary>
    public class Product
    {
        public int Id { get; set; }

        /// <summary>رمز المادة الفريد</summary>
        public string Code { get; set; }

        public string Name { get; set; }

        /// <summary>وحدة القياس: قطعة، متر، كرتون...</summary>
        public string Unit { get; set; } = "قطعة";

        public string Category { get; set; }

        public string ModelNumber { get; set; }
        public string SerialNumber { get; set; }
        public string Barcode { get; set; }

        public decimal CostPrice { get; set; }
        public decimal SellPrice { get; set; }
        public int Quantity { get; set; }
        public int? MinStockAlert { get; set; } = 5;

        public string Description { get; set; }

        /// <summary>ربط اختياري بحساب المخزون</summary>
        public int? InventoryAccountId { get; set; }
        public Account InventoryAccount { get; set; }

        /// <summary>حساب تكلفة المبيعات / البضاعة</summary>
        public int? CostAccountId { get; set; }
        public Account CostAccount { get; set; }

        /// <summary>حساب إيراد المبيعات</summary>
        public int? RevenueAccountId { get; set; }
        public Account RevenueAccount { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<Purchase> Purchases { get; set; }
        public ICollection<Sale> Sales { get; set; }
    }
}
