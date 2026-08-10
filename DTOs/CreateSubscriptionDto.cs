using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;


namespace ISPSystem.DTOs
{
    public class CreateSubscriptionDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int PlanId { get; set; }

        public int? Days { get; set; } // optional
    }
}
