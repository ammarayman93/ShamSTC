using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.Models
{
    public class SystemSetting
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
        public string Group { get; set; }
    }
}
