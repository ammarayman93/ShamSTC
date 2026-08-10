#nullable disable
namespace ISPSystem.DTOs
{
    public class UpdateClientDto
    {
        public string? FullName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? DisplayName { get; set; }
        public string? Title { get; set; }
        public string? Phone { get; set; }
        public string? SecondaryPhone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Status { get; set; }
        public string? MacAddress { get; set; }
        public string? IpAddress { get; set; }

        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? Gender { get; set; }
        public System.DateTime? BirthDate { get; set; }
        public string? BirthPlace { get; set; }

        public string? City { get; set; }
        public string? Area { get; set; }
        public string? Street { get; set; }
        public string? Apartment { get; set; }
        public string? ContractNumber { get; set; }
        public string? Notes { get; set; }
        public string? PaymentStatus { get; set; }
        public string? NationalId { get; set; }

        public string? IdFrontImage { get; set; }
        public string? IdBackImage { get; set; }
        public string? ContractFrontImage { get; set; }
        public string? ContractBackImage { get; set; }
    }
}
