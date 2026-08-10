using System;

namespace ISPSystem.Models
{
    public class FinancialReport
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal TotalProfit { get; set; }
        public int TotalPayments { get; set; }
        public int TotalInvoices { get; set; }
        public int OverdueInvoices { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.Now;
        public string ReportType { get; set; } // Daily, Weekly, Monthly, Yearly
    }
}