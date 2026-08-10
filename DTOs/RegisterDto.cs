namespace ISPSystem.DTOs
{
    public class RegisterDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; } // ãËáÇğ "Admin" Ãæ "Accountant"
    }
}