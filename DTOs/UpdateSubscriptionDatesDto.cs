#nullable disable
using System;

namespace ISPSystem.DTOs
{
    public class UpdateSubscriptionDatesDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
