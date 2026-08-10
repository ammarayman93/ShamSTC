using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using Microsoft.Extensions.Logging;

namespace ISPSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<AppDbContext>();

                    // ÅäÔÇÁ ÇáÌÏÇæá ÅÐÇ ãÇ ßÇäÊ ãæÌæÏÉ
                    context.Database.EnsureCreated();

                    // ÅÖÇÝÉ ÇáÈíÇäÇÊ ÇáÃæáíÉ (Admin + Plans)
                    SeedData.Initialize(services);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Database error: " + ex.Message);
                }
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                });
    }
}