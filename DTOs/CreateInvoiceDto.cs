using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.DTOs
{
    public class CreateInvoiceDto
    {
        public int ClientId { get; set; }
        public int? SubscriptionId { get; set; }
        public decimal Total { get; set; }
        public DateTime DueDate { get; set; }
    }
}

