using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateSubDto
    {
        [Required(ErrorMessage = "User ID is required")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Days are required")]
        [Range(1, 365, ErrorMessage = "Days must be between 1 and 365")]
        public int Days { get; set; }

        [Range(0, 1000000, ErrorMessage = "Invalid amount")]
        public decimal? PaidAmount { get; set; }
    }
}