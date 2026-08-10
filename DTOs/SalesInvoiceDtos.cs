using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class SalesInvoiceItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(0.001, double.MaxValue)]
        public decimal Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }

    public class CreateSalesInvoiceDto
    {
        public string InvoiceNumber { get; set; }
        public int? ClientId { get; set; }
        public string ClientName { get; set; }
        public string ClientPhone { get; set; }
        public DateTime? Date { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
        public string PaymentStatus { get; set; } = "Paid";
        public decimal? PaidAmount { get; set; }
        public int? CashBoxId { get; set; }
        public string Notes { get; set; }

        [Required, MinLength(1)]
        public List<SalesInvoiceItemDto> Items { get; set; }
    }

    public class SalesInvoiceListDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; }
        public string ClientName { get; set; }
        public DateTime Date { get; set; }
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public string PaymentStatus { get; set; }
        public string CashBoxName { get; set; }
        public int ItemsCount { get; set; }
    }

    public class SalesInvoiceDetailDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; }
        public int? ClientId { get; set; }
        public string ClientName { get; set; }
        public string ClientPhone { get; set; }
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
        public List<SalesInvoiceItemDetailDto> Items { get; set; }
    }

    public class SalesInvoiceItemDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }
}
