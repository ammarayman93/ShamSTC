using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateUserDto
    {
        [Required(ErrorMessage = "اسم المستخدم مطلوب")]
        [StringLength(50)]
        public string Username { get; set; }

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [MinLength(4, ErrorMessage = "كلمة المرور يجب أن تكون 4 أحرف على الأقل")]
        public string Password { get; set; }

        [Required(ErrorMessage = "الاسم الكامل مطلوب")]
        [StringLength(100)]
        public string FullName { get; set; }

        // اختياري — لا تستخدم [Phone] مباشرة لأنها ترفض "" 
        [StringLength(20)]
        public string Phone { get; set; }

        // اختياري — لا تستخدم [EmailAddress] مباشرة لأنها ترفض ""
        [StringLength(100)]
        public string Email { get; set; }

        public string Status { get; set; } = "Active";
        public string Role { get; set; } = "Employee";
    }
}
