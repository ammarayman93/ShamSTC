    using Microsoft.AspNetCore.Mvc;
    using ISPSystem.Data;
    using ISPSystem.DTOs;
    using ISPSystem.Services;
    using Microsoft.EntityFrameworkCore;
    using ISPSystem.Helpers;
    using System.Threading.Tasks;
    using System;
using ISPSystem.Models;
using Microsoft.AspNetCore.Http;

    namespace ISPSystem.Controllers
    {
        [ApiController]
        [Route("api/auth")]
        public class AuthController : ControllerBase
        {
            private readonly AppDbContext _context;
            private readonly JwtService _jwt;
            private readonly PasswordService _password;

            public AuthController(AppDbContext context, JwtService jwt, PasswordService password)
            {
                _context = context;
                _jwt = jwt;
                _password = password;
            }

            // 🏢 تسجيل دخول الموظفين (User)
            [HttpPost("login")]
            public async Task<IActionResult> Login([FromBody] LoginDto dto)
            {
                if (dto == null || string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                    return BadRequest(ApiResponse<string>.Fail("Username and password are required"));

                // البحث في جدول Users (الموظفين)
                var user = await _context.Users
                    .FirstOrDefaultAsync(x => x.Username == dto.Username);

                if (user == null || !_password.Verify(dto.Password, user.Password))
                    return Unauthorized(ApiResponse<string>.Fail("Invalid username or password"));

                if (user.Status != "Active")
                    return Unauthorized(ApiResponse<string>.Fail("Account is disabled"));

                // تحديث آخر تسجيل دخول
                user.LastLogin = DateTime.Now;
                await _context.SaveChangesAsync();

                var token = _jwt.GenerateToken(user);

                // حفظ الـ Token داخل الكوكيز لأمان الموظفين
                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,                    // ← غيّرها لـ false للتطوير
                    SameSite = SameSiteMode.Lax,       // ← غيّرها لـ Lax
                    Expires = DateTime.UtcNow.AddHours(8)
                });

                // ⚠️ تعديل: إرجاع الرد بصيغةApiResponse الموحدة حتى لا تنهار واجهة الإدارة
                return Ok(ApiResponse<object>.Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        role = user.Role ?? "Admin",
                        fullName = user.FullName,
                        type = "user"
                    }
                }));
            }

            // 👥 تسجيل دخول العملاء (Client)
            [HttpPost("client/login")]
            public async Task<IActionResult> ClientLogin([FromBody] LoginDto dto)
            {
                if (dto == null || string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                    return BadRequest(ApiResponse<string>.Fail("Username and password are required"));

                // البحث في جدول Clients (الزبائن)
                var client = await _context.Clients
                    .FirstOrDefaultAsync(x => x.Username == dto.Username);

                if (client == null || !_password.Verify(dto.Password, client.Password))
                    return Unauthorized(ApiResponse<string>.Fail("Invalid username or password"));

                if (client.Status != "Active")
                    return Unauthorized(ApiResponse<string>.Fail("Account is disabled"));

                // تحديث آخر تسجيل دخول
                client.LastLogin = DateTime.Now;
                await _context.SaveChangesAsync();

                var token = _jwt.GenerateToken(client);

                return Ok(ApiResponse<object>.Ok(new
                {
                    token,
                    user = new
                    {
                        id = client.Id,
                        username = client.Username,
                        role = "Client",
                        fullName = client.FullName,
                        type = "client"
                    }
                }));
            }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // 1. التحقق من وجود المستخدم مسبقاً
            var exists = await _context.Users.AnyAsync(x => x.Username == dto.Username);
            if (exists)
                return BadRequest(ApiResponse<string>.Fail("Username already exists"));

            // 2. إنشاء كائن المستخدم الجديد
            var newUser = new User // افترضت أن اسم الموديل هو User
            {
                Username = dto.Username,
                FullName = dto.FullName,
                Role = dto.Role ?? "Admin",
                Status = "Active",
                // 3. تشفير كلمة المرور باستخدام الخدمة المتوفرة لديك
                Password = _password.Hash(dto.Password)
            };

            // 4. الحفظ في قاعدة البيانات
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Ok("User registered successfully"));
        }

        // 🔒 إعادة تعيين كلمة المرور
        [HttpPost("reset-password")]
            public async Task<IActionResult> ResetPassword([FromBody] string username)
            {
                if (string.IsNullOrEmpty(username))
                    return BadRequest(ApiResponse<string>.Fail("Username is required"));

                var client = await _context.Clients.FirstOrDefaultAsync(x => x.Username == username);

                if (client == null)
                    return NotFound(ApiResponse<string>.Fail("User not found"));

                var newPassword = PasswordGenerator.Generate();
                client.Password = _password.Hash(newPassword);

                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.Ok(new
                {
                    username = client.Username,
                    newPassword
                }));
            }
        }
    }