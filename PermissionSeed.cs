using System;
using System.Collections.Generic;
using System.Linq;
using ISPSystem.Data;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem
{
    public static class PermissionSeed
    {
        public static void Seed(AppDbContext context)
        {
            try
            {
                EnsureTables(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Permission tables ensure failed: {ex.Message}");
            }

            try
            {
                if (!context.Permissions.Any())
                {
                    var perms = BuildPermissions();
                    context.Permissions.AddRange(perms);
                    context.SaveChanges();
                    Console.WriteLine("✅ Permissions seeded");
                }

                if (!context.RolePermissions.Any())
                {
                    SeedRolePermissions(context);
                    Console.WriteLine("✅ Role permissions seeded");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ PermissionSeed data failed: {ex.Message}");
            }
        }

        /// <summary>إنشاء جداول الصلاحيات إن لم تكن موجودة (MySQL)</summary>
        public static void EnsureTables(AppDbContext context)
        {
            // EF قد لا يضيف جداول جديدة على قاعدة قديمة بدون migration
            context.Database.ExecuteSqlRaw(@"
CREATE TABLE IF NOT EXISTS `Permissions` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(80) NOT NULL,
  `Name` varchar(120) NOT NULL,
  `Group` varchar(40) NULL,
  `Description` varchar(250) NULL,
  `SortOrder` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Permissions_Code` (`Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

            context.Database.ExecuteSqlRaw(@"
CREATE TABLE IF NOT EXISTS `RolePermissions` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Role` varchar(40) NOT NULL,
  `PermissionId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_RolePermissions_Role_PermissionId` (`Role`,`PermissionId`),
  KEY `IX_RolePermissions_PermissionId` (`PermissionId`),
  CONSTRAINT `FK_RolePermissions_Permissions` FOREIGN KEY (`PermissionId`) REFERENCES `Permissions` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

            context.Database.ExecuteSqlRaw(@"
CREATE TABLE IF NOT EXISTS `UserPermissions` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `PermissionId` int NOT NULL,
  `IsGranted` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_UserPermissions_UserId_PermissionId` (`UserId`,`PermissionId`),
  KEY `IX_UserPermissions_PermissionId` (`PermissionId`),
  CONSTRAINT `FK_UserPermissions_Permissions` FOREIGN KEY (`PermissionId`) REFERENCES `Permissions` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_UserPermissions_Users` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
        }

        private static List<Permission> BuildPermissions()
        {
            int order = 0;
            Permission P(string code, string name, string group, string desc = null)
                => new Permission
                {
                    Code = code,
                    Name = name,
                    Group = group,
                    Description = desc,
                    SortOrder = ++order
                };

            return new List<Permission>
            {
                P("clients.view", "عرض العملاء", "clients"),
                P("clients.create", "إضافة عميل", "clients"),
                P("clients.edit", "تعديل بيانات العميل", "clients"),
                P("clients.renew", "تجديد الاشتراك", "clients"),
                P("clients.speed", "تغيير السرعة", "clients"),
                P("clients.suspend", "إيقاف العميل", "clients"),
                P("clients.activate", "تفعيل العميل", "clients"),
                P("clients.password.view", "عرض كلمة المرور", "clients"),
                P("clients.password.reset", "إعادة تعيين كلمة المرور", "clients"),
                P("clients.delete", "حذف عميل", "clients"),
                P("clients.delete.permanent", "حذف نهائي من RADIUS", "clients"),
                P("clients.status", "عرض حالة الاتصال", "clients"),

                P("plans.view", "عرض الباقات", "plans"),
                P("plans.manage", "إدارة الباقات", "plans"),
                P("mikrotik.view", "عرض أجهزة MikroTik", "mikrotik"),
                P("mikrotik.manage", "إدارة أجهزة MikroTik", "mikrotik"),

                P("invoices.view", "عرض الفواتير", "accounting"),
                P("invoices.create", "إنشاء فاتورة", "accounting"),
                P("invoices.pay", "سداد فاتورة", "accounting"),
                P("payments.view", "عرض الدفعات", "accounting"),
                P("payments.create", "تسجيل دفعة", "accounting"),
                P("cashboxes.view", "عرض الصناديق", "accounting"),
                P("cashboxes.manage", "إدارة الصناديق والحركات", "accounting"),
                P("expenses.view", "عرض المصاريف", "accounting"),
                P("expenses.create", "تسجيل مصروف", "accounting"),
                P("sales.view", "عرض المبيعات", "accounting"),
                P("sales.manage", "إدارة المبيعات", "accounting"),
                P("purchases.view", "عرض المشتريات", "accounting"),
                P("purchases.manage", "إدارة المشتريات", "accounting"),
                P("accounts.view", "عرض شجرة الحسابات", "accounting"),
                P("accounts.manage", "إدارة الحسابات", "accounting"),
                P("reports.view", "عرض التقارير", "accounting"),
                P("reports.financial", "التقارير المالية", "accounting"),

                P("tickets.view", "عرض التذاكر", "support"),
                P("tickets.manage", "إدارة التذاكر", "support"),

                P("users.view", "عرض المستخدمين", "system"),
                P("users.manage", "إدارة المستخدمين والصلاحيات", "system"),
                P("settings.manage", "إعدادات النظام", "system"),
                P("backup.manage", "النسخ الاحتياطي", "system"),
                P("dashboard.view", "لوحة التحكم", "system"),
            };
        }

        private static void SeedRolePermissions(AppDbContext context)
        {
            var map = context.Permissions.ToDictionary(p => p.Code, p => p.Id);

            void Grant(string role, params string[] codes)
            {
                foreach (var c in codes)
                {
                    if (!map.TryGetValue(c, out var id)) continue;
                    context.RolePermissions.Add(new RolePermission { Role = role, PermissionId = id });
                }
            }

            Grant("Employee",
                "dashboard.view",
                "clients.view", "clients.create", "clients.edit", "clients.renew",
                "clients.speed", "clients.activate", "clients.status",
                "clients.password.view", "clients.password.reset",
                "plans.view",
                "tickets.view", "tickets.manage"
            );

            Grant("Support",
                "dashboard.view",
                "clients.view", "clients.edit", "clients.renew", "clients.speed",
                "clients.suspend", "clients.activate", "clients.status",
                "clients.password.view", "clients.password.reset",
                "plans.view", "mikrotik.view",
                "tickets.view", "tickets.manage"
            );

            Grant("Accountant",
                "dashboard.view",
                "clients.view",
                "invoices.view", "invoices.create", "invoices.pay",
                "payments.view", "payments.create",
                "cashboxes.view", "cashboxes.manage",
                "expenses.view", "expenses.create",
                "sales.view", "sales.manage",
                "purchases.view", "purchases.manage",
                "accounts.view", "accounts.manage",
                "reports.view", "reports.financial",
                "plans.view"
            );

            context.SaveChanges();
        }
    }
}
