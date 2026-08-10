using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class UpdateUserDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [Phone]
        public string Phone { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        public string Role { get; set; }

        /// <summary>
        /// Active / Inactive / Suspended
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// اختياري — إذا أُرسل يتم تغيير كلمة المرور
        /// </summary>
        [MinLength(4)]
        public string Password { get; set; }
    }
}
