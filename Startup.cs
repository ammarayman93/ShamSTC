using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using AspNetCoreRateLimit;
using ISPSystem.Repositories;
using ISPSystem.Middleware;
using ISPSystem.Hubs;
using ISPSystem.Models;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ISPSystem
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            // ========================================
            // ✅ إعدادات MySQL - متوافقة مع Docker
            // ========================================
            var connectionString = GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new Exception("Connection string is empty. Please check your configuration.");
            }

            try
            {
                var serverVersion = ServerVersion.AutoDetect(connectionString);
                services.AddDbContext<AppDbContext>(options =>
                    options.UseMySql(connectionString, serverVersion));

                Console.WriteLine($"✅ MySQL Connection Successful: {connectionString}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ MySQL Connection Failed: {ex.Message}");
                throw;
            }

            // ========================================
            // ✅ تسجيل جميع الخدمات
            // ========================================

            // Hosted Services
            services.AddHostedService<ExpirationService>();

            // Singleton Services
            services.AddSingleton<JwtService>();
            services.AddSingleton<PdfService>();
            services.AddScoped<MikroTikService>();
            services.AddSingleton<PasswordService>();

            // Scoped Services
            services.AddScoped<UserService>();
            services.AddScoped<RadiusService>();
            services.AddScoped<RadiusClientService>();
            services.AddScoped<AuditService>();
            services.AddScoped<InvoiceService>();
            services.AddScoped<SaleService>();
            services.AddScoped<PaymentService>();
            services.AddScoped<SubscriptionService>();
            services.AddScoped<NotificationService>();
            services.AddScoped<ITicketService,TicketService>();
            services.AddScoped<ProductService>();
            services.AddScoped<PurchaseService>();
            services.AddScoped<MikroTikDeviceService>();
            services.AddScoped<AccountService>();
            services.AddScoped<CashBoxService>();
            services.AddScoped<MaterialService>();
            services.AddScoped<PurchaseInvoiceService>();
            services.AddScoped<SalesInvoiceService>();

            // SignalR
            services.AddSignalR();

            // Repositories
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // AutoMapper
            services.AddAutoMapper(typeof(Startup));

            // HTTP Context
            services.AddHttpContextAccessor();

            // تسجيل إعدادات RADIUS Server
            services.Configure<RadiusServerConfig>(
                Configuration.GetSection("RadiusServer"));

            // CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", builder =>
                {
                    builder.WithOrigins(
                            "http://localhost:5173",
                            "http://localhost:3000",
                            "http://localhost:4200",
                            "http://localhost:5000",
                            "http://localhost:8080",
                            "http://localhost:80"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            // JWT Authentication
            var jwtKey = Configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                jwtKey = "YourSuperSecretKeyHereWithAtLeast32CharactersForJWT2026!";
                Console.WriteLine("⚠️ Using default JWT Key");
            }

            var key = Encoding.UTF8.GetBytes(jwtKey);
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Configuration["Jwt:Issuer"] ?? "ISPSystem",
                    ValidAudience = Configuration["Jwt:Audience"] ?? "ISPClients",
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            services.AddSingleton(new BackupService(connectionString));

            // Authorization Policies
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("AccountantOnly", policy => policy.RequireRole("Admin", "Accountant"));
            });

            // Rate Limiting
            services.AddMemoryCache();
            services.Configure<IpRateLimitOptions>(options =>
            {
                options.GeneralRules = new List<RateLimitRule>
                {
                    new RateLimitRule { Endpoint = "*", Limit = 100, Period = "1m" },
                    new RateLimitRule { Endpoint = "*/api/auth/login", Limit = 5, Period = "1m" }
                };
            });
            services.AddInMemoryRateLimiting();
            services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

            // Health Checks
            services.AddHealthChecks();

            // Swagger
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "ISP System API",
                    Version = "v2",
                    Description = "API for Internet Service Provider Management System"
                });

                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Enter 'Bearer' followed by your token"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });
        }

        // ========================================
        // ✅ دالة مساعدة للحصول على سلسلة الاتصال
        // ========================================
        private string GetConnectionString()
        {
            // 1. محاولة قراءة من appsettings.json
            var connectionString = Configuration.GetConnectionString("DefaultConnection");

            if (!string.IsNullOrEmpty(connectionString))
            {
                Console.WriteLine($"✅ Using connection string from appsettings.json");
                return connectionString;
            }

            // 2. محاولة قراءة من متغيرات البيئة (Docker)
            var host = Environment.GetEnvironmentVariable("DB_HOST") ?? "mysql";
            var database = Environment.GetEnvironmentVariable("DB_NAME") ?? "isp_system";
            var user = Environment.GetEnvironmentVariable("DB_USER") ?? "root";
            var password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "RootP@ssw0rd2026!";
            var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "3306";

            connectionString = $"Server={host};Port={port};Database={database};User={user};Password={password};";
            Console.WriteLine($"✅ Using connection string from environment variables");
            return connectionString;
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }

            app.UseMiddleware<ExceptionMiddleware>();
            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseIpRateLimiting();

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "ISP System API V2");
                c.RoutePrefix = "swagger";
                c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHealthChecks("/health");
                endpoints.MapControllers();
                endpoints.MapHub<NotificationHub>("/notificationHub");
            });
        }
    }
}