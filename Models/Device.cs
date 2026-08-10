using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.Models
{
    public class Device
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string MacAddress { get; set; }
        public string IpAddress { get; set; }

        public Client Client { get; set; }
    }
}
