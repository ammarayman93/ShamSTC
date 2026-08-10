using System;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateCashBoxDto
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public int? AccountId { get; set; }

        public decimal OpeningBalance { get; set; }

        public string Notes { get; set; }
    }

    public class UpdateCashBoxDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public int? AccountId { get; set; }

        public bool IsActive { get; set; }

        public string Notes { get; set; }
    }

    public class CashBoxTransferDto
    {
        [Required]
        public int FromCashBoxId { get; set; }

        [Required]
        public int ToCashBoxId { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public string Notes { get; set; }
    }

    public class ManualCashMovementDto
    {
        [Required]
        public int CashBoxId { get; set; }

        /// <summary>In أو Out</summary>
        [Required]
        public string Direction { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public int? AccountId { get; set; }

        public string Notes { get; set; }
    }

    public class CashBoxDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int? AccountId { get; set; }
        public string AccountName { get; set; }
        public decimal Balance { get; set; }
        public bool IsActive { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CashBoxTransactionDto
    {
        public int Id { get; set; }
        public int CashBoxId { get; set; }
        public string CashBoxName { get; set; }
        public string Direction { get; set; }
        public decimal Amount { get; set; }
        public decimal BalanceAfter { get; set; }
        public int? AccountId { get; set; }
        public string AccountName { get; set; }
        public string ReferenceType { get; set; }
        public int? ReferenceId { get; set; }
        public DateTime Date { get; set; }
        public string Notes { get; set; }
    }
}
