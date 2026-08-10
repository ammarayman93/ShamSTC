using System;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateMaterialDto
    {
        [StringLength(50)]
        public string Code { get; set; }

        [Required, StringLength(200)]
        public string Name { get; set; }

        [StringLength(30)]
        public string Unit { get; set; } = "قطعة";

        [StringLength(100)]
        public string Category { get; set; }

        [StringLength(100)]
        public string ModelNumber { get; set; }

        [StringLength(100)]
        public string SerialNumber { get; set; }

        [StringLength(100)]
        public string Barcode { get; set; }

        [Range(0, double.MaxValue)]
        public decimal CostPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal SellPrice { get; set; }

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public int? MinStockAlert { get; set; } = 5;

        public string Description { get; set; }

        public int? InventoryAccountId { get; set; }
        public int? CostAccountId { get; set; }
        public int? RevenueAccountId { get; set; }
    }

    public class UpdateMaterialDto
    {
        [StringLength(50)]
        public string Code { get; set; }

        [Required, StringLength(200)]
        public string Name { get; set; }

        [StringLength(30)]
        public string Unit { get; set; }

        [StringLength(100)]
        public string Category { get; set; }

        [StringLength(100)]
        public string ModelNumber { get; set; }

        [StringLength(100)]
        public string SerialNumber { get; set; }

        [StringLength(100)]
        public string Barcode { get; set; }

        public decimal? CostPrice { get; set; }
        public decimal? SellPrice { get; set; }
        public int? MinStockAlert { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }

        public int? InventoryAccountId { get; set; }
        public int? CostAccountId { get; set; }
        public int? RevenueAccountId { get; set; }
    }

    /// <summary>تعديل كمية يدوياً (جرد / تسوية)</summary>
    public class AdjustStockDto
    {
        /// <summary>الكمية الجديدة المطلقة أو الفرق حسب Mode</summary>
        public int Quantity { get; set; }

        /// <summary>Set = تعيين | Add = إضافة | Subtract = طرح</summary>
        public string Mode { get; set; } = "Set";

        public string Notes { get; set; }
    }

    public class MaterialDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Unit { get; set; }
        public string Category { get; set; }
        public string ModelNumber { get; set; }
        public string SerialNumber { get; set; }
        public string Barcode { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SellPrice { get; set; }
        public int Quantity { get; set; }
        public int? MinStockAlert { get; set; }
        public bool IsLowStock { get; set; }
        public string Description { get; set; }
        public int? InventoryAccountId { get; set; }
        public string InventoryAccountName { get; set; }
        public int? CostAccountId { get; set; }
        public string CostAccountName { get; set; }
        public int? RevenueAccountId { get; set; }
        public string RevenueAccountName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
