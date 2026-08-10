using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Token { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
