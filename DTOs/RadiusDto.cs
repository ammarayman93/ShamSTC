// backend/DTOs/RadiusDto.cs
namespace ISPSystem.DTOs
{
    public class RadiusAuthenticateDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string NasIp { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
    }

    public class RadiusServerTestDto
    {
        public string Host { get; set; } = "192.168.1.121";
        public int Port { get; set; } = 1812;
        public string Secret { get; set; } = "Sham@mm@r!1993#Riad#1991";
    }
}