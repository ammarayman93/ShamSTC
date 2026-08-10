using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design; // 🛠️ لحل مشكلة IDesignTimeDbContextFactory
using ISPSystem.Data;                      // 🛠️ لحل مشكلة التعرف على AppDbContext (إذا كان في مجلد Data)
using ISPSystem.Models;                    // 🛠️ لضمان رؤية الموديلات المرتبطة

namespace ISPSystem.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            // نص الاتصال الافتراضي لوقت التصميم وتوليد الـ Migrations
            string connectionString = "server=localhost;database=ispsystem_db;user=root;password=your_password";

            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}