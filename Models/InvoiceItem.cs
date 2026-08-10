using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        public int InvoiceId { get; set; }
    }
}
