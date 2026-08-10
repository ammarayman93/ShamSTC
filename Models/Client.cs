using System;
using System.Collections.Generic;

namespace ISPSystem.Models
{
    public class Client
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string MacAddress { get; set; }
        public string IpAddress { get; set; }
        public string Address { get; set; }
        public string NationalId { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? LastLogin { get; set; }
        public int? CreatedBy { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string DisplayName { get; set; }
        public string Title { get; set; }
        public string FatherName { get; set; }
        public string MotherName { get; set; }
        public string Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string BirthPlace { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public string Street { get; set; }
        public string Apartment { get; set; }
        public string ContractNumber { get; set; }
        public string Notes { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public string SecondaryPhone { get; set; }

        public string IdFrontImage { get; set; }
        public string IdBackImage { get; set; }
        public string ContractFrontImage { get; set; }
        public string ContractBackImage { get; set; }

        public bool HasFreeSubscription { get; set; } = false;
        public string FreeSpeed { get; set; }

        public string ClientType { get; set; } = "Regular";
        public string Role { get; set; } = "Client";

        /// <summary>السيرفر/الراوتر المسؤول عن هذا العميل (فرع)</summary>
        public int? MikroTikServerId { get; set; }
        public MikroTikDevice MikroTikServer { get; set; }

        public ICollection<Subscription> Subscriptions { get; set; }
        public ICollection<Payment> Payments { get; set; }
        public ICollection<Invoice> Invoices { get; set; }
        public ICollection<Device> Devices { get; set; }
    }
}
