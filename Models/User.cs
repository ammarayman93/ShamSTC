using System;

namespace ISPSystem.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } = "Employee"; // Admin, Accountant, Employee, Support
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? LastLogin { get; set; }
        public int? CreatedBy { get; set; }
    }
}