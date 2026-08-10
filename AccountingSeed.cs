using System;
using System.Collections.Generic;
using System.Linq;
using ISPSystem.Data;
using ISPSystem.Models;

namespace ISPSystem
{
    /// <summary>
    /// بذرة شجرة الحسابات + الصناديق الستة
    /// استدعِ AccountingSeed.Seed(context) من SeedData.Initialize
    /// </summary>
    public static class AccountingSeed
    {
        public static void Seed(AppDbContext context)
        {
            if (!context.Accounts.Any())
            {
                SeedChartOfAccounts(context);
                Console.WriteLine("✅ Chart of accounts seeded");
            }

            if (!context.CashBoxes.Any())
            {
                SeedCashBoxes(context);
                Console.WriteLine("✅ Cash boxes seeded");
            }
        }

        private static void SeedChartOfAccounts(AppDbContext context)
        {
            // المستوى 1
            var assets = A("1", "الأصول", "Asset", null, false, 1, 1);
            var liabilities = A("2", "الخصوم", "Liability", null, false, 1, 2);
            var equity = A("3", "حقوق الملكية", "Equity", null, false, 1, 3);
            var revenue = A("4", "الإيرادات", "Revenue", null, false, 1, 4);
            var expenses = A("5", "المصروفات", "Expense", null, false, 1, 5);
            var costs = A("6", "التكاليف", "Cost", null, false, 1, 6);

            context.Accounts.AddRange(assets, liabilities, equity, revenue, expenses, costs);
            context.SaveChanges();

            // أصول
            var curAssets = A("1-1", "الأصول المتداولة", "Asset", assets.Id, false, 2, 10);
            var fixAssets = A("1-2", "الأصول الثابتة", "Asset", assets.Id, false, 2, 20);
            context.Accounts.AddRange(curAssets, fixAssets);
            context.SaveChanges();

            context.Accounts.AddRange(
                A("1-1-1", "النقدية", "Asset", curAssets.Id, true, 3, 11),
                A("1-1-2", "المدينون", "Asset", curAssets.Id, true, 3, 12),
                A("1-1-3", "المخزون", "Asset", curAssets.Id, true, 3, 13),
                A("1-1-4", "المصروفات المقدمة", "Asset", curAssets.Id, true, 3, 14),
                A("1-2-1", "العقارات", "Asset", fixAssets.Id, true, 3, 21),
                A("1-2-2", "الآلات", "Asset", fixAssets.Id, true, 3, 22),
                A("1-2-3", "السيارات", "Asset", fixAssets.Id, true, 3, 23),
                A("1-2-4", "الأثاث", "Asset", fixAssets.Id, true, 3, 24)
            );

            // خصوم
            var curLiab = A("2-1", "الخصوم المتداولة", "Liability", liabilities.Id, false, 2, 30);
            var longLiab = A("2-2", "الخصوم طويلة الأجل", "Liability", liabilities.Id, false, 2, 40);
            context.Accounts.AddRange(curLiab, longLiab);
            context.SaveChanges();

            context.Accounts.AddRange(
                A("2-1-1", "الدائنون", "Liability", curLiab.Id, true, 3, 31),
                A("2-1-2", "القروض قصيرة الأجل", "Liability", curLiab.Id, true, 3, 32),
                A("2-1-3", "الإيرادات المقدمة", "Liability", curLiab.Id, true, 3, 33),
                A("2-2-1", "القروض طويلة الأجل", "Liability", longLiab.Id, true, 3, 41),
                A("2-2-2", "الالتزامات المستقبلية", "Liability", longLiab.Id, true, 3, 42)
            );

            // حقوق ملكية
            context.Accounts.AddRange(
                A("3-1", "رأس المال", "Equity", equity.Id, true, 2, 50),
                A("3-2", "الأرباح المحتجزة", "Equity", equity.Id, true, 2, 51),
                A("3-3", "الاحتياطيات", "Equity", equity.Id, true, 2, 52),
                A("3-4", "توزيعات الأرباح", "Equity", equity.Id, true, 2, 53)
            );

            // إيرادات
            var opRev = A("4-1", "الإيرادات التشغيلية", "Revenue", revenue.Id, false, 2, 60);
            var nonOpRev = A("4-2", "الإيرادات غير التشغيلية", "Revenue", revenue.Id, false, 2, 70);
            context.Accounts.AddRange(opRev, nonOpRev);
            context.SaveChanges();

            context.Accounts.AddRange(
                A("4-1-1", "مبيعات المنتجات أو الخدمات", "Revenue", opRev.Id, true, 3, 61),
                A("4-1-2", "إيرادات الاشتراكات / التفعيل", "Revenue", opRev.Id, true, 3, 62),
                A("4-2-1", "الفوائد المكتسبة", "Revenue", nonOpRev.Id, true, 3, 71),
                A("4-2-2", "الدخل من الاستثمارات", "Revenue", nonOpRev.Id, true, 3, 72)
            );

            // مصروفات (عامة)
            context.Accounts.AddRange(
                A("5-1", "مصروفات عامة وإدارية", "Expense", expenses.Id, true, 2, 80),
                A("5-2", "مصروفات تسويق", "Expense", expenses.Id, true, 2, 81),
                A("5-3", "مصروفات صيانة شبكة", "Expense", expenses.Id, true, 2, 82)
            );

            // تكاليف
            var fixedCost = A("6-1", "التكاليف الثابتة", "Cost", costs.Id, false, 2, 90);
            var varCost = A("6-2", "التكاليف المتغيرة", "Cost", costs.Id, false, 2, 100);
            context.Accounts.AddRange(fixedCost, varCost);
            context.SaveChanges();

            context.Accounts.AddRange(
                A("6-1-1", "الرواتب الأساسية", "Cost", fixedCost.Id, true, 3, 91),
                A("6-1-2", "الإيجار", "Cost", fixedCost.Id, true, 3, 92),
                A("6-1-3", "التأمين", "Cost", fixedCost.Id, true, 3, 93),
                A("6-2-1", "تكاليف الشحن", "Cost", varCost.Id, true, 3, 101),
                A("6-2-2", "عمولات المبيعات", "Cost", varCost.Id, true, 3, 102)
            );

            context.SaveChanges();
        }

        private static void SeedCashBoxes(AppDbContext context)
        {
            // ربط النقدية إن وُجدت
            var cashAccount = context.Accounts.FirstOrDefault(a => a.Code == "1-1-1");

            var boxes = new List<CashBox>
            {
                new CashBox { Code = "ACT",   Name = "صندوق التفعيلات", AccountId = cashAccount?.Id, Balance = 0, IsActive = true, CreatedAt = DateTime.Now },
                new CashBox { Code = "SALES", Name = "صندوق المبيعات",   AccountId = cashAccount?.Id, Balance = 0, IsActive = true, CreatedAt = DateTime.Now },
                new CashBox { Code = "EXP",   Name = "صندوق المصاريف",   AccountId = cashAccount?.Id, Balance = 0, IsActive = true, CreatedAt = DateTime.Now },
                new CashBox { Code = "PUR",   Name = "صندوق المشتريات",  AccountId = cashAccount?.Id, Balance = 0, IsActive = true, CreatedAt = DateTime.Now },
                new CashBox { Code = "BANK",  Name = "صندوق البنوك",     AccountId = cashAccount?.Id, Balance = 0, IsActive = true, CreatedAt = DateTime.Now },
                new CashBox { Code = "CASH",  Name = "صندوق الكاش",      AccountId = cashAccount?.Id, Balance = 0, IsActive = true, CreatedAt = DateTime.Now },
            };

            context.CashBoxes.AddRange(boxes);
            context.SaveChanges();
        }

        private static Account A(string code, string name, string type, int? parentId, bool postable, int level, int sort)
        {
            return new Account
            {
                Code = code,
                Name = name,
                Type = type,
                ParentId = parentId,
                IsPostable = postable,
                IsActive = true,
                OpeningBalance = 0,
                Level = level,
                SortOrder = sort,
                CreatedAt = DateTime.Now
            };
        }
    }
}
