using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.DTOs
{
    public class ManualSubscribeDto
    {
        public int UserId { get; set; }
        public int PlanId { get; set; }
        public int Days { get; set; }
    }
}
