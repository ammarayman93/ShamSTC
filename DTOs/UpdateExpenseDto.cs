using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.DTOs
{
    public class UpdateExpenseDto
    {
        public decimal Amount { get; set; }
        public string Reason { get; set; }
        public string Category { get; set; }
    }
}
