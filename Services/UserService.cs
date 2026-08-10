using System;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.Models;
using ISPSystem.DTOs;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Helpers;

namespace ISPSystem.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _password;
        private readonly AuditService _audit;
        private readonly RadiusService _radius;
        private readonly MikroTikService _mikroTik;

        public UserService(AppDbContext context, PasswordService password, AuditService audit, RadiusService radius, MikroTikService mikroTik)
        {
            _context = context;
            _password = password;
            _audit = audit;
            _radius = radius;
            _mikroTik = mikroTik;
        }

        // ============= طرق الموظفين (Users) =============

        public async Task<object> GetAll(UserQuery query)
        {
            var users = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                users = users.Where(x =>
                    x.Username.Contains(query.Search) ||
                    x.FullName.Contains(query.Search));
            }

            var total = await users.CountAsync();

            var data = await users
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.Email,
                    u.Role,
                    u.Status,
                    u.CreatedAt,
                    u.LastLogin
                })
                .ToListAsync();

            return new
            {
                total,
                page = query.Page,
                pageSize = query.PageSize,
                data
            };
        }

        public async Task<User> GetById(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> Create(CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                throw new Exception("اسم المستخدم موجود بالفعل");

            var user = new User
            {
                Username = dto.Username,
                Password = _password.Hash(dto.Password),
                FullName = dto.FullName,
                Phone = dto.Phone,
                Email = dto.Email,
                Role = dto.Role,
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            await _audit.Log("Create", "User", user.Id);

            return user;
        }

        public async Task<User> Update(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return null;

            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.Email = dto.Email;
            user.Role = dto.Role;

            await _context.SaveChangesAsync();
            await _audit.Log("Update", "User", user.Id);

            return user;
        }

        public async Task<bool> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            await _audit.Log("Delete", "User", user.Id);
            return true;
        }

        // ============= طرق العملاء (Clients) =============

        public object GetAllClients(ClientQuery query)
        {
            var clients = _context.Clients.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                clients = clients.Where(c =>
                    c.Username.Contains(query.Search) ||
                    c.FullName.Contains(query.Search) ||
                    c.Phone.Contains(query.Search) ||
                    c.NationalId.Contains(query.Search));
            }

            if (!string.IsNullOrEmpty(query.Status))
            {
                clients = clients.Where(c => c.Status == query.Status);
            }

            var total = clients.Count();

            var data = clients
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => new
                {
                    c.Id,
                    c.Username,
                    c.FullName,
                    c.Phone,
                    c.Email,
                    c.MacAddress,
                    c.IpAddress,
                    c.Status,
                    c.CreatedAt,
                    c.NationalId
                })
                .ToList();

            return new
            {
                total,
                page = query.Page,
                pageSize = query.PageSize,
                data
            };
        }

        public async Task<Client> GetClientById(int id)
        {
            return await _context.Clients
                .Include(c => c.Subscriptions)
                .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        // ========== 🔥 الطريقة الرئيسية: إنشاء عميل مع إضافته إلى MikroTik و Radius ==========
        // ========== 🔥 إنشاء عميل مع RADIUS كمسؤول رئيسي ==========
        // ========== 🔥 إنشاء عميل مع RADIUS كمسؤول رئيسي فقط ==========
        public async Task<Client> CreateClient(CreateClientDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NationalId) || dto.NationalId.Length != 11 || !dto.NationalId.All(char.IsDigit))
                throw new Exception("الرقم الوطني يجب أن يكون 11 خانة رقمية");

            if (string.IsNullOrWhiteSpace(dto.Phone))
                throw new Exception("رقم الهاتف مطلوب");

            // الاسم: FullName أو FirstName + LastName
            var hasFull = !string.IsNullOrWhiteSpace(dto.FullName);
            var hasParts = !string.IsNullOrWhiteSpace(dto.FirstName) || !string.IsNullOrWhiteSpace(dto.LastName);
            if (!hasFull && !hasParts)
                throw new Exception("الاسم مطلوب (الاسم الكامل أو الاسم الأول والأخير)");

            // الباقة أو اشتراك مجاني
            Plan plan = null;
            int durationDays;
            decimal price;
            string speed;

            if (dto.FreeSubscription)
            {
                durationDays = dto.FreeDays > 0 ? dto.FreeDays : 30;
                price = 0;
                speed = string.IsNullOrWhiteSpace(dto.FreeSpeed) ? "2M/2M" : dto.FreeSpeed;
                if (dto.PlanId.HasValue && dto.PlanId.Value > 0)
                    plan = await _context.Plans.FindAsync(dto.PlanId.Value);
                // باقة مجانية وهمية لتجنب FK PlanId = 0
                if (plan == null)
                {
                    plan = await _context.Plans.FirstOrDefaultAsync(p => p.Name == "اشتراك مجاني");
                    if (plan == null)
                    {
                        plan = new Plan
                        {
                            Name = "اشتراك مجاني",
                            Speed = speed,
                            Price = 0,
                            DurationDays = durationDays,
                            Description = "باقة مجانية تلقائية",
                            IsActive = true,
                            SortOrder = 999
                        };
                        _context.Plans.Add(plan);
                        await _context.SaveChangesAsync();
                    }
                    else
                    {
                        // حدّث السرعة حسب الطلب
                        plan.Speed = speed;
                        plan.DurationDays = durationDays;
                        await _context.SaveChangesAsync();
                    }
                }
            }
            else
            {
                if (!dto.PlanId.HasValue || dto.PlanId.Value <= 0)
                    throw new Exception("يجب اختيار باقة صحيحة");
                plan = await _context.Plans.FindAsync(dto.PlanId.Value);
                if (plan == null)
                    throw new Exception("الخطة غير موجودة");
                durationDays = plan.DurationDays;
                price = plan.Price;
                speed = plan.Speed ?? "1M/1M";
            }

            var existingCount = await _context.Clients
                .Where(c => c.NationalId == dto.NationalId)
                .CountAsync();

            var sequence = existingCount + 1;
            // معرف العميل / اسم المستخدم: {nationalId}-{seq}@sham.net أو ما يُرسل
            var username = !string.IsNullOrWhiteSpace(dto.Username)
                ? dto.Username.Trim()
                : $"{dto.NationalId}-{sequence}@sham.net";

            if (await _context.Clients.AnyAsync(c => c.Username == username))
                throw new Exception("اسم المستخدم موجود مسبقاً");

            var plainPassword = !string.IsNullOrWhiteSpace(dto.Password)
                ? dto.Password
                : RandomPasswordService.GeneratePassword(6);
            var hashedPassword = _password.Hash(plainPassword);

            var endDate = DateTime.Now.AddDays(durationDays);

            if (string.IsNullOrWhiteSpace(dto.NationalId) || dto.NationalId.Length != 11 || !dto.NationalId.All(char.IsDigit))
                throw new Exception("الرقم الوطني يجب أن يكون 11 خانة رقمية");

            if (string.IsNullOrWhiteSpace(dto.IdFrontImage) || string.IsNullOrWhiteSpace(dto.IdBackImage))
                throw new Exception("صور الهوية (الوجه الأمامي والخلفي) مطلوبة");

            var fullName = !string.IsNullOrWhiteSpace(dto.FullName)
                ? dto.FullName.Trim()
                : $"{dto.FirstName} {dto.LastName}".Trim();

            var client = new Client
            {
                Username = username,
                Password = hashedPassword,
                FullName = fullName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DisplayName = dto.DisplayName ?? fullName,
                Title = dto.Title,
                Phone = dto.Phone,
                Email = !string.IsNullOrWhiteSpace(dto.Email) ? dto.Email : username,
                NationalId = dto.NationalId,
                Address = dto.Address ?? "",
                Status = dto.IsActive ? "Active" : "Suspended",
                CreatedAt = DateTime.Now,
                MacAddress = RandomPasswordService.GenerateRandomMacAddress(),
                IpAddress = RandomPasswordService.GenerateRandomIpAddress(),
                FatherName = dto.FatherName,
                MotherName = dto.MotherName,
                Gender = dto.Gender,
                BirthDate = dto.BirthDate,
                BirthPlace = dto.BirthPlace,
                City = dto.City,
                Area = dto.Area,
                Street = dto.Street,
                Apartment = dto.Apartment,
                ContractNumber = dto.ContractNumber,
                Notes = dto.Notes,
                SecondaryPhone = dto.SecondaryPhone,
                PaymentStatus = dto.PaymentStatus ?? "Pending",
                IdFrontImage = dto.IdFrontImage,
                IdBackImage = dto.IdBackImage,
                ContractFrontImage = dto.ContractFrontImage,
                ContractBackImage = dto.ContractBackImage,
                HasFreeSubscription = dto.FreeSubscription,
                FreeSpeed = dto.FreeSubscription ? (dto.FreeSpeed ?? "2M/2M") : null
            };

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. حفظ العميل
                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

                // 2. إنشاء الاشتراك
                var subscription = new Subscription
                {
                    ClientId = client.Id,
                    PlanId = plan!.Id,
                    StartDate = DateTime.Now,
                    EndDate = endDate,
                    IsActive = true,
                    Status = "Active",
                    PaidAmount = price
                };
                _context.Subscriptions.Add(subscription);
                await _context.SaveChangesAsync();

                // 3. إنشاء الفاتورة
                var invoice = new Invoice
                {
                    InvoiceNumber = GenerateInvoiceNumber(),
                    ClientId = client.Id,
                    SubscriptionId = subscription.Id,
                    SubTotal = price,
                    Tax = 0,
                    Discount = 0,
                    Total = price,
                    Date = DateTime.Now,
                    DueDate = DateTime.Now.AddDays(7),
                    IsPaid = true,
                    PaidAt = DateTime.Now,
                    Status = "Paid"
                };
                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                // 4. إنشاء الدفعة
                var payment = new Payment
                {
                    ClientId = client.Id,
                    SubscriptionId = subscription.Id,
                    InvoiceId = invoice.Id,
                    Amount = price,
                    Date = DateTime.Now,
                    PaymentMethod = dto.PaymentMethod ?? "Cash",
                    Status = "Completed"
                };
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                await _audit.Log("Create", "Client", client.Id);

                // ========== 🟢 RADIUS فقط (المسؤول الرئيسي عن الاتصال والسرعة) ==========
                // ========== RADIUS ==========
                try
                {
                    string radiusSpeed = (speed ?? "1M/1M")
                        .Replace("Mb/s", "M")
                        .Replace("Mbps", "M")
                        .Trim();

                    if (!radiusSpeed.Contains("/"))
                        radiusSpeed = $"{radiusSpeed}/{radiusSpeed}";

                    bool radiusResult = await _radius.CreateUser(
                        client.Username,
                        plainPassword,
                        radiusSpeed,
                        endDate
                    );

                    Console.WriteLine(radiusResult
                        ? $"✅ RADIUS OK: {client.Username}"
                        : $"⚠️ RADIUS FAILED: {client.Username}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ RADIUS ERROR: {ex.Message}");
                }// ========== 🟢 RADIUS فقط (المسؤول الوحيد) ==========
                 // ========== 🟢 RADIUS فقط (المسؤول الرئيسي عن الاتصال والسرعة) ==========
                try
                {
                    string radiusSpeed = (speed ?? "1M/1M")
                        .Replace("Mb/s", "M")
                        .Replace("Mbps", "M")
                        .Trim();

                    if (!radiusSpeed.Contains("/"))
                        radiusSpeed = $"{radiusSpeed}/{radiusSpeed}";

                    bool radiusResult = await _radius.CreateUser(
                        client.Username,
                        plainPassword,
                        radiusSpeed,
                        endDate
                    );

                    Console.WriteLine(radiusResult
                        ? $"✅ RADIUS OK: {client.Username}"
                        : $"⚠️ RADIUS FAILED: {client.Username}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ RADIUS ERROR: {ex.Message}");
                }

                // ========== تم حذف إضافة MikroTik PPP Secret عمداً ==========
                // المايكروتيك يجب أن يعتمد على RADIUS فقط (use-radius=yes)

                // ❌ لا تضف المستخدم محلياً في MikroTik
                // MikroTik يجب أن يكون مضبوطاً على RADIUS Authentication فقط
                // ========== MikroTik Secrets (مؤقت) ==========


                // إرجاع كلمة المرور العادية (مرة واحدة فقط)
                client.Password = plainPassword;
                return client;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌ فشل إنشاء العميل: {ex.Message}");
                throw new Exception($"فشل إنشاء العميل: {ex.Message}");
            }
        }

        // تحديث معلومات الشبكة للعميل
        public async Task<bool> UpdateClientNetworkInfo(int clientId, string macAddress, string ipAddress)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client == null)
                return false;

            if (!string.IsNullOrEmpty(macAddress))
                client.MacAddress = macAddress;

            if (!string.IsNullOrEmpty(ipAddress))
                client.IpAddress = ipAddress;

            await _context.SaveChangesAsync();
            return true;
        }

        // حذف عميل
        public async Task<bool> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null) return false;

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            await _audit.Log("Delete", "Client", id);
            return true;
        }

        private string GenerateInvoiceNumber()
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.Month;
            var count = _context.Invoices.Count() + 1;
            return $"INV-{year}{month:D2}-{count:D6}";
        }
    }
}