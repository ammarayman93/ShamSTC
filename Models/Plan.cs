using System.Collections.Generic;

namespace ISPSystem.Models
{
    public class Plan
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Speed { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }

        public ICollection<Subscription> Subscriptions { get; set; }
    }
}