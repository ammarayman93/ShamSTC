using ISPSystem.Data;
using ISPSystem.Models;
using ISPSystem.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;

namespace ISPSystem
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = serviceProvider.GetRequiredService<AppDbContext>();
            var passwordService = serviceProvider.GetRequiredService<PasswordService>();

            // ========== إنشاء الموظفين (Users) ==========
            if (!context.Users.Any())
            {
                var users = new[]
                {
                    new User
                    {
                        Username = "admin",
                        Password = passwordService.Hash("admin123"),
                        FullName = "مدير النظام",
                        Phone = "123456789",
                        Email = "admin@sham.net",
                        Role = "Admin",
                        Status = "Active",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "accountant",
                        Password = passwordService.Hash("accountant123"),
                        FullName = "محاسب النظام",
                        Phone = "123456788",
                        Email = "accountant@sham.net",
                        Role = "Accountant",
                        Status = "Active",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "employee",
                        Password = passwordService.Hash("employee123"),
                        FullName = "موظف خدمة عملاء",
                        Phone = "123456787",
                        Email = "employee@sham.net",
                        Role = "Employee",
                        Status = "Active",
                        CreatedAt = DateTime.Now
                    }
                };

                context.Users.AddRange(users);
                Console.WriteLine("✅ Users created (Admin, Accountant, Employee)");
            }

            // ========== إنشاء العملاء (Clients) ==========
            if (!context.Clients.Any())
            {
                for (int i = 1; i <= 10; i++)
                {
                    context.Clients.Add(new Client
                    {
                        Username = $"sham.net@0102088503-{i}",
                        Password = passwordService.Hash($"client{i}123"),
                        FullName = $"عميل تجريبي {i}",
                        Phone = $"09{i:0000000}",
                        Email = $"client{i}@sham.net",
                        MacAddress = $"00:11:22:33:44:{i:00}",
                        IpAddress = $"10.126.211.{100 + i}",
                        Address = $"دمشق، سوريا",
                        Status = "Active",
                        CreatedAt = DateTime.Now.AddDays(-i)
                    });
                }
                Console.WriteLine("✅ Sample clients created");
            }

            // ========== إنشاء الباقات ==========
            if (!context.Plans.Any())
            {
                var plans = new[]
                {
                    new Plan { Name = "2Mb/s (Damascus) 2025", Speed = "2Mb/s", Price = 1100, DurationDays = 30, IsActive = true, SortOrder = 1 },
                    new Plan { Name = "4Mb/s (Damascus) 2025", Speed = "4Mb/s", Price = 1500, DurationDays = 30, IsActive = true, SortOrder = 2 },
                    new Plan { Name = "8Mb/s (Damascus) 2025", Speed = "8Mb/s", Price = 2200, DurationDays = 30, IsActive = true, SortOrder = 3 },
                    new Plan { Name = "16Mb/s (Damascus) 2025", Speed = "16Mb/s", Price = 3700, DurationDays = 30, IsActive = true, SortOrder = 4 }
                };
                context.Plans.AddRange(plans);
                Console.WriteLine("✅ Default plans created");
            }
            if (!context.Plans.Any())
            {
                // ... الباقات ...
                Console.WriteLine("✅ Default plans created");
            }

            // ========== شجرة الحسابات + الصناديق ==========
            AccountingSeed.Seed(context);

            context.SaveChanges();
        }
    }
}