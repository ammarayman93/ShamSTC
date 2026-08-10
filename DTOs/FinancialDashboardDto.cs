using System.Collections.Generic;

namespace ISPSystem.DTOs
{
    public class FinancialDashboardDto
    {
        // الإحصائيات الرئيسية
        public decimal TodayRevenue { get; set; }
        public decimal WeekRevenue { get; set; }
        public decimal MonthRevenue { get; set; }
        public decimal YearRevenue { get; set; }
        public decimal TotalRevenue { get; set; }

        // المصروفات
        public decimal TodayExpenses { get; set; }
        public decimal MonthExpenses { get; set; }
        public decimal TotalExpenses { get; set; }

        // الأرباح
        public decimal TodayProfit { get; set; }
        public decimal MonthProfit { get; set; }
        public decimal TotalProfit { get; set; }

        // الفواتير
        public int TotalInvoices { get; set; }
        public int PaidInvoices { get; set; }
        public int UnpaidInvoices { get; set; }
        public int OverdueInvoices { get; set; }
        public decimal OverdueAmount { get; set; }

        // المدفوعات
        public int TotalPayments { get; set; }
        public decimal AveragePayment { get; set; }

        // الرسوم البيانية
        public List<MonthlyRevenueDto> MonthlyRevenue { get; set; }
        public List<CategoryExpenseDto> ExpensesByCategory { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public string Month { get; set; }
        public decimal Revenue { get; set; }
        public decimal Expenses { get; set; }
        public decimal Profit { get; set; }
    }

    public class CategoryExpenseDto
    {
        public string Category { get; set; }
        public decimal Amount { get; set; }
        public int Percentage { get; set; }
    }
}