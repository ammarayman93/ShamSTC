using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.DTOs
{
    public class ClientQuery
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; } = "";
        public string Status { get; set; } = "";
    }
}
