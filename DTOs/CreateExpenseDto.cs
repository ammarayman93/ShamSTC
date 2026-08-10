using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateExpenseDto
    {
        [Required]
        [Range(0.01, 10000000)]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(500)]
        public string Reason { get; set; }

        [Required]
        public string Category { get; set; }

        public string ReferenceNumber { get; set; }
        public string Notes { get; set; }

        /// <summary>اختياري — إن لم يُحدد يُستخدم صندوق المصاريف EXP</summary>
        public int? CashBoxId { get; set; }

        public int? AccountId { get; set; }
    }
}
