using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ISPSystem.DTOs
{
    public class UserQuery
    {
        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string Search { get; set; } = string.Empty;
    }
}