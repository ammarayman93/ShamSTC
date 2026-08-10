using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.DTOs
{
    public class UpdateSubscriptionDto
    {
        public int UserId { get; set; }
        public int PlanId { get; set; }
        public int Days { get; set; }
    }
}
