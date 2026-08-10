using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class PurchaseInvoiceItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(0.001, double.MaxValue)]
        public decimal Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal UnitCost { get; set; }
    }

    public class CreatePurchaseInvoiceDto
    {
        public string InvoiceNumber { get; set; }

        [Required]
        public string SupplierName { get; set; }

        public string SupplierPhone { get; set; }

        public DateTime? Date { get; set; }

        public decimal Tax { get; set; }
        public decimal Discount { get; set; }

        /// <summary>Paid | Partial | Unpaid</summary>
        public string PaymentStatus { get; set; } = "Paid";

        public decimal? PaidAmount { get; set; }

        public int? CashBoxId { get; set; }

        public string Notes { get; set; }

        [Required, MinLength(1)]
        public List<PurchaseInvoiceItemDto> Items { get; set; }
    }

    public class PurchaseInvoiceListDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; }
        public string SupplierName { get; set; }
        public DateTime Date { get; set; }
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public string PaymentStatus { get; set; }
        public string CashBoxName { get; set; }
        public int ItemsCount { get; set; }
    }

    public class PurchaseInvoiceDetailDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; }
        public string SupplierName { get; set; }
        public string SupplierPhone { get; set; }
        public DateTime Date { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public string PaymentStatus { get; set; }
        public int? CashBoxId { get; set; }
        public string CashBoxName { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<PurchaseInvoiceItemDetailDto> Items { get; set; }
    }

    public class PurchaseInvoiceItemDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public decimal LineTotal { get; set; }
    }
}
