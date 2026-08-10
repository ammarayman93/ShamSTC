using System;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateClientDto
    {
        [Required(ErrorMessage = "الرقم الوطني مطلوب")]
        public string NationalId { get; set; }

        public string FullName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string DisplayName { get; set; }
        public string Title { get; set; }

        [Required(ErrorMessage = "رقم الهاتف مطلوب")]
        public string Phone { get; set; }

        public string SecondaryPhone { get; set; }
        public string Email { get; set; }
        public string FatherName { get; set; }
        public string MotherName { get; set; }
        public string Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string BirthPlace { get; set; }

        public string Address { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public string Street { get; set; }
        public string Apartment { get; set; }
        public string ContractNumber { get; set; }
        public string Notes { get; set; }

        public string IdFrontImage { get; set; }
        public string IdBackImage { get; set; }
        public string ContractFrontImage { get; set; }
        public string ContractBackImage { get; set; }

        public string Username { get; set; }
        public string Password { get; set; }
        public bool IsActive { get; set; } = true;

        public int? PlanId { get; set; }

        public string PaymentMethod { get; set; } = "Cash";
        public string PaymentStatus { get; set; } = "Pending";

        public bool FreeSubscription { get; set; } = false;
        public string FreeSpeed { get; set; } = "2M/2M";
        public int FreeDays { get; set; } = 30;

        /// <summary>معرف سيرفر MikroTik (الفرع) الذي يخدم هذا العميل</summary>
        public int? MikroTikServerId { get; set; }
    }
}
