// backend/Models/RadiusServerConfig.cs
namespace ISPSystem.Models
{
    public class RadiusServerConfig
    {
        public string Host { get; set; } = "192.168.1.121";
        public int Port { get; set; } = 1812;
        public int AcctPort { get; set; } = 1813;
        public string Secret { get; set; } = "testing123"; // „› «Õ «·„‘«—ﬂ…
        public int Timeout { get; set; } = 5; // ÀÊ«‰Ì
        public int Retries { get; set; } = 3;
    }
}