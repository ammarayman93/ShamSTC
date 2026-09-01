#nullable disable
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Models;
using ISPSystem.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/clients")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly AppDbContext _context;
        private readonly AuditService _audit;
        private readonly RadiusService _radius;
        private readonly SubscriptionService _subscriptionService;
        private readonly PasswordService _password;
        private readonly MikroTikService _mikroTik;
        private readonly CashBoxService _cashBoxes;

        public ClientsController(
            UserService userService,
            AppDbContext context,
            AuditService audit,
            RadiusService radius,
            SubscriptionService subscriptionService,
            PasswordService password,
            MikroTikService mikroTik,
            CashBoxService cashBoxes)
        {
            _userService = userService;
            _context = context;
            _audit = audit;
            _radius = radius;
            _subscriptionService = subscriptionService;
            _password = password;
            _mikroTik = mikroTik;
            _cashBoxes = cashBoxes;
        }

        // 📋 الحصول على جميع العملاء
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ClientQuery query)
        {
            if (query.Page <= 0) query.Page = 1;
            if (query.PageSize <= 0) query.PageSize = 10;

            var clientsQuery = _context.Clients.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                var search = query.Search.Trim();
                clientsQuery = clientsQuery.Where(c =>
                    c.Username.Contains(search) ||
                    c.FullName.Contains(search) ||
                    c.Phone.Contains(search) ||
                    (c.NationalId != null && c.NationalId.Contains(search)));
            }

            if (!string.IsNullOrEmpty(query.Status))
                clientsQuery = clientsQuery.Where(c => c.Status == query.Status);

            var total = await clientsQuery.CountAsync();

            // جلب العملاء أولاً
            var clients = await clientsQuery
                .OrderByDescending(c => c.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var clientIds = clients.Select(c => c.Id).ToList();

            // الاشتراكات النشطة مع الباقة
            var activeSubs = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => clientIds.Contains(s.ClientId) && s.IsActive)
                .GroupBy(s => s.ClientId)
                .Select(g => g.OrderByDescending(s => s.EndDate).FirstOrDefault())
                .ToListAsync();

            var subDict = activeSubs
                .Where(s => s != null)
                .ToDictionary(s => s.ClientId);

            // حالة PPP الفعلية هي المصدر الأساسي. تُخزَّن اللقطة لخمس ثوانٍ
            // كي لا تفتح كل صفحة اتصال API جديداً إلى كل راوتر.
            var onlineUsers = await _radius.GetOnlineUsers();
            var mikroTikSnapshot = await _mikroTik.GetCachedActiveUsersSnapshotAsync();

            var data = clients.Select(c =>
            {
                subDict.TryGetValue(c.Id, out var sub);
                OnlineSessionInfo radiusSession = null;
                if (!string.IsNullOrWhiteSpace(c.Username))
                    _radius.TryFindOnlineSession(onlineUsers, c.Username, out radiusSession);

                // يقيّد العميل المرتبط بجهاز معيّن إلى ذلك الجهاز فقط. أما
                // العملاء القدامى بلا تعيين فيُبحث عنهم في كل الأجهزة المفعّلة.
                var mikroTikSession = _mikroTik.FindActiveUser(
                    mikroTikSnapshot.Users,
                    c.Username,
                    c.MikroTikServerId)
                    ?? _mikroTik.FindActiveUser(mikroTikSnapshot.Users, c.Username);
                var routerWasChecked = mikroTikSession != null
                    || mikroTikSnapshot.WasRouterChecked(c.MikroTikServerId);

                // لا نعرض radacct كـ "متصل" عندما استجاب الراوتر ولم تعد له
                // جلسة PPP، لأن سجل المحاسبة قد يكون عالقاً بعد قطع مفاجئ.
                var isOnline = mikroTikSession != null || (!routerWasChecked && radiusSession != null);
                var onlineSource = mikroTikSession != null
                    ? "mikrotik"
                    : (!routerWasChecked && radiusSession != null ? "radius-unverified" : null);

                return new
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
                    c.NationalId,
                    c.Address,
                    c.City,
                    c.Area,
                    c.FatherName,
                    c.MotherName,
                    c.Notes,
                    c.PaymentStatus,
                    c.SecondaryPhone,
                    IsOnline = isOnline,
                    OnlineIp = mikroTikSession?.Address ?? radiusSession?.FramedIp,
                    OnlineMac = radiusSession?.MacAddress ?? mikroTikSession?.CallerId,
                    OnlineSince = radiusSession?.StartTime,
                    OnlineSource = onlineSource,
                    OnlineRouterId = mikroTikSession?.MikroTikDeviceId,
                    OnlineRouterName = mikroTikSession?.MikroTikDeviceName,
                    DataUsed = "Bytes 0",
                    ActiveSubscription = sub == null ? null : new
                    {
                        sub.Id,
                        PlanId = sub.PlanId,
                        PlanName = sub.Plan?.Name ?? "باقة غير معروفة",
                        PlanSpeed = sub.Plan?.Speed,
                        sub.StartDate,
                        sub.EndDate,
                        sub.IsActive,
                        DaysRemaining = (sub.EndDate - DateTime.Now).Days
                    }
                };
            }).ToList();

            return Ok(ApiResponse<object>.Ok(new
            {
                total,
                page = query.Page,
                pageSize = query.PageSize,
                data
            }));
        }

        // 🔍 الحصول على عميل محدد
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var client = await _context.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var sub = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.ClientId == id)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            // استخدم نفس القاعدة المعتمدة في القائمة: جلسة PPP الفعلية أولاً،
            // ولا نلجأ إلى radacct إلا عند تعذر فحص الراوتر المعني.
            var onlineMap = await _radius.GetOnlineUsers();
            _radius.TryFindOnlineSession(onlineMap, client.Username, out var radiusSession);
            var mikroTikSnapshot = await _mikroTik.GetCachedActiveUsersSnapshotAsync();
            var mikroTikSession = _mikroTik.FindActiveUser(
                mikroTikSnapshot.Users,
                client.Username,
                client.MikroTikServerId)
                ?? _mikroTik.FindActiveUser(mikroTikSnapshot.Users, client.Username);
            var routerWasChecked = mikroTikSession != null
                || mikroTikSnapshot.WasRouterChecked(client.MikroTikServerId);
            var isOnline = mikroTikSession != null || (!routerWasChecked && radiusSession != null);
            var onlineIp = mikroTikSession?.Address ?? radiusSession?.FramedIp;

            return Ok(ApiResponse<object>.Ok(new
            {
                client.Id,
                client.Username,
                client.FullName,
                client.FirstName,
                client.LastName,
                client.DisplayName,
                client.Title,
                client.Phone,
                client.SecondaryPhone,
                client.Email,
                client.NationalId,
                client.Status,
                client.CreatedAt,
                client.LastLogin,
                client.MacAddress,
                client.IpAddress,
                client.Address,
                client.City,
                client.Area,
                client.Street,
                client.Apartment,
                client.FatherName,
                client.MotherName,
                client.Gender,
                client.BirthDate,
                client.BirthPlace,
                client.ContractNumber,
                client.Notes,
                client.PaymentStatus,
                client.HasFreeSubscription,
                client.FreeSpeed,
                client.IdFrontImage,
                client.IdBackImage,
                client.ContractFrontImage,
                client.ContractBackImage,
                IsOnline = isOnline,
                OnlineIp = onlineIp,
                OnlineSource = mikroTikSession != null
                    ? "mikrotik"
                    : (!routerWasChecked && radiusSession != null ? "radius-unverified" : null),
                OnlineRouterId = mikroTikSession?.MikroTikDeviceId,
                OnlineRouterName = mikroTikSession?.MikroTikDeviceName,
                ActiveSubscription = sub == null ? null : new
                {
                    sub.Id,
                    PlanId = sub.PlanId,
                    PlanName = sub.Plan?.Name,
                    PlanSpeed = sub.Plan?.Speed,
                    PlanPrice = sub.Plan?.Price,
                    sub.StartDate,
                    sub.EndDate,
                    sub.IsActive,
                    sub.Status,
                    sub.PaidAmount,
                    DaysRemaining = (sub.EndDate - DateTime.Now).Days
                }
            }));
        }

        /// <summary>
        /// الحصول على اسم المستخدم التالي ورقم العقد التالي لرقم وطني معيّن
        /// مثال: 03310011711 → 03310011711-2@sham.net إن وُجد -1 مسبقاً
        /// </summary>
        [HttpGet("next-identifiers")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> GetNextIdentifiers([FromQuery] string nationalId)
        {
            try
            {
                var data = await _userService.GetNextClientIdentifiers(nationalId);
                return Ok(ApiResponse<object>.Ok(data));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // ➕ إضافة عميل جديد
        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات العميل غير صالحة"));

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                return BadRequest(ApiResponse<string>.Fail(string.Join(" | ", errors)));
            }

            try
            {
                var client = await _userService.CreateClient(dto);

                return Ok(ApiResponse<object>.Ok(new
                {
                    client = new
                    {
                        client.Id,
                        client.Username,
                        client.FullName,
                        client.Phone,
                        client.Email,
                        client.MacAddress,
                        client.IpAddress,
                        client.NationalId,
                        client.ContractNumber,
                        client.City,
                        client.MikroTikServerId,
                        client.Status,
                        Password = client.Password // تُعرض مرة واحدة فقط (نص عادي)
                    },
                    message = "تم إنشاء العميل بنجاح وإضافته إلى RADIUS"
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🔄 تحديث بيانات العميل
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateClientDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة فارغة"));

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            if (dto.FullName != null) client.FullName = dto.FullName;
            if (dto.FirstName != null) client.FirstName = dto.FirstName;
            if (dto.LastName != null) client.LastName = dto.LastName;
            if (dto.DisplayName != null) client.DisplayName = dto.DisplayName;
            if (dto.Title != null) client.Title = dto.Title;
            if (dto.Phone != null) client.Phone = dto.Phone;
            if (dto.SecondaryPhone != null) client.SecondaryPhone = dto.SecondaryPhone;
            if (dto.Email != null) client.Email = dto.Email;
            if (dto.Address != null) client.Address = dto.Address;
            if (dto.Status != null) client.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.MacAddress)) client.MacAddress = dto.MacAddress;
            if (!string.IsNullOrEmpty(dto.IpAddress)) client.IpAddress = dto.IpAddress;
            if (dto.FatherName != null) client.FatherName = dto.FatherName;
            if (dto.MotherName != null) client.MotherName = dto.MotherName;
            if (dto.Gender != null) client.Gender = dto.Gender;
            if (dto.BirthDate.HasValue) client.BirthDate = dto.BirthDate;
            if (dto.BirthPlace != null) client.BirthPlace = dto.BirthPlace;
            if (dto.City != null) client.City = dto.City;
            if (dto.Area != null) client.Area = dto.Area;
            if (dto.Street != null) client.Street = dto.Street;
            if (dto.Apartment != null) client.Apartment = dto.Apartment;
            if (dto.ContractNumber != null) client.ContractNumber = dto.ContractNumber;
            if (dto.Notes != null) client.Notes = dto.Notes;
            if (dto.PaymentStatus != null) client.PaymentStatus = dto.PaymentStatus;
            if (dto.NationalId != null && dto.NationalId.Length == 11)
                client.NationalId = dto.NationalId;
            if (dto.IdFrontImage != null) client.IdFrontImage = dto.IdFrontImage;
            if (dto.IdBackImage != null) client.IdBackImage = dto.IdBackImage;
            if (dto.ContractFrontImage != null) client.ContractFrontImage = dto.ContractFrontImage;
            if (dto.ContractBackImage != null) client.ContractBackImage = dto.ContractBackImage;

            // مزامنة الاسم الكامل من الأول+الأخير إن وُجدا
            if (!string.IsNullOrWhiteSpace(client.FirstName) || !string.IsNullOrWhiteSpace(client.LastName))
            {
                var built = $"{client.FirstName} {client.LastName}".Trim();
                if (!string.IsNullOrWhiteSpace(built))
                    client.FullName = built;
            }

            await _context.SaveChangesAsync();
            await _audit.Log("Update", "Client", id);

            return Ok(ApiResponse<object>.Ok(new { client.Id, client.Username, client.FullName }, "تم تحديث بيانات العميل بنجاح"));
        }

        // ⛔ إيقاف العميل
        [HttpPost("{id}/suspend")]
        [Authorize(Roles = "Admin,Support,Employee")]
        public async Task<IActionResult> Suspend(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            if (client.Status == "Suspended")
                return BadRequest(ApiResponse<string>.Fail("العميل موقوف بالفعل"));

            client.Status = "Suspended";
            await _context.SaveChangesAsync();

            // 1) تعطيل في RADIUS
            var radiusOk = await _radius.DisableUser(client.Username);

            // 2) إغلاق جلسة المحاسبة
            try { await _radius.DisconnectUser(client.Username); }
            catch (Exception ex) { Console.WriteLine($"DisconnectUser: {ex.Message}"); }

            // 3) فصل الجلسة الفعلية من المايكروتيك فوراً
            bool kicked = false;
            try { kicked = await KickClientSession(client); }
            catch (Exception ex) { Console.WriteLine($"KickActiveUser: {ex.Message}"); }

            await _audit.Log("Suspend", "Client", id);

            return Ok(ApiResponse<object>.Ok(new
            {
                clientId = id,
                status = "Suspended",
                radiusDisabled = radiusOk,
                sessionKicked = kicked,
                message = kicked
                    ? "تم إيقاف العميل وفصل جلسته من الشبكة"
                    : "تم إيقاف العميل (لم تكن هناك جلسة نشطة على المايكروتيك)"
            }));
        }

        // ▶️ تفعيل العميل
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin,Support,Employee")]
        public async Task<IActionResult> Activate(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            if (client.Status == "Active")
                return BadRequest(ApiResponse<string>.Fail("العميل مفعّل بالفعل"));

            var hasActiveSub = await _context.Subscriptions
                .AnyAsync(s => s.ClientId == id && s.IsActive && s.EndDate > DateTime.Now);

            if (!hasActiveSub)
                return BadRequest(ApiResponse<string>.Fail("لا يمكن تفعيل العميل لأنه لا يملك اشتراكاً نشطاً"));

            client.Status = "Active";
            await _context.SaveChangesAsync();

            var radiusOk = await _radius.EnableUser(client.Username);
            await _audit.Log("Activate", "Client", id);

            return Ok(ApiResponse<object>.Ok(new
            {
                clientId = id,
                status = "Active",
                radiusEnabled = radiusOk,
                message = "تم تفعيل العميل بنجاح"
            }));
        }

        // 🔄 تجديد الاشتراك — اختيار باقة (سرعة) + إضافة المبلغ لصندوق التفعيل
        [HttpPost("{id}/renew")]
        [HasPermission("clients.renew")]
        public async Task<IActionResult> Renew(int id, [FromBody] RenewClientDto dto = null)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            try
            {
                int? planId = dto?.PlanId;
                var sub = await _subscriptionService.Renew(id, planId);

                // تحديث تاريخ الانتهاء في RADIUS + تفعيل المستخدم
                await _radius.UpdateExpiration(client.Username, sub.EndDate);
                await _radius.EnableUser(client.Username);

                // سرعة الباقة المختارة
                if (sub.Plan != null && !string.IsNullOrWhiteSpace(sub.Plan.Speed))
                {
                    await _radius.UpdateSpeed(client.Username, sub.Plan.Speed);
                }
                try { await KickClientSession(client); }
                catch { /* لا جلسة */ }

                // فاتورة + دفعة + صندوق التفعيلات (ACT)
                decimal amount = sub.Plan?.Price ?? 0;
                Payment payment = null;
                if (amount > 0)
                {
                    var invoice = new Invoice
                    {
                        InvoiceNumber = $"INV-RNW-{DateTime.Now:yyyyMMddHHmmss}-{client.Id}",
                        ClientId = client.Id,
                        SubscriptionId = sub.Id,
                        SubTotal = amount,
                        Tax = 0,
                        Discount = 0,
                        Total = amount,
                        Date = DateTime.Now,
                        DueDate = DateTime.Now,
                        IsPaid = true,
                        PaidAt = DateTime.Now,
                        Status = "Paid"
                    };
                    _context.Invoices.Add(invoice);
                    await _context.SaveChangesAsync();

                    var actBox = await _context.CashBoxes.FirstOrDefaultAsync(c => c.Code == "ACT" && c.IsActive);
                    payment = new Payment
                    {
                        ClientId = client.Id,
                        SubscriptionId = sub.Id,
                        InvoiceId = invoice.Id,
                        Amount = amount,
                        Date = DateTime.Now,
                        PaymentMethod = "Cash",
                        Status = "Completed",
                        Notes = $"تجديد اشتراك — {sub.Plan?.Name} — {sub.Plan?.Speed}",
                        CashBoxId = actBox?.Id
                    };
                    _context.Payments.Add(payment);
                    await _context.SaveChangesAsync();

                    if (actBox != null)
                    {
                        var revenueAccount = await _context.Accounts
                            .FirstOrDefaultAsync(a => a.Code == "4-1-2" && a.IsActive);
                        await _cashBoxes.PostReference(
                            actBox.Id,
                            "In",
                            amount,
                            revenueAccount?.Id ?? actBox.AccountId,
                            "Renewal",
                            sub.Id,
                            $"تجديد اشتراك — {client.FullName ?? client.Username} — {sub.Plan?.Name} ({sub.Plan?.Speed})",
                            null);
                    }
                }

                client.Status = "Active";
                client.PaymentStatus = amount > 0 ? "Paid" : client.PaymentStatus;
                await _context.SaveChangesAsync();
                await _audit.Log("Renew", "Client", id);

                return Ok(ApiResponse<object>.Ok(new
                {
                    message = "تم تجديد الاشتراك بنجاح وإضافته لصندوق التفعيل",
                    newEndDate = sub.EndDate,
                    daysAdded = sub.Plan?.DurationDays,
                    planId = sub.PlanId,
                    planName = sub.Plan?.Name,
                    planSpeed = sub.Plan?.Speed,
                    amount = amount,
                    paymentId = payment?.Id,
                    cashBox = "صندوق التفعيلات"
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🚀 تحديث السرعة في RADIUS
        [HttpPut("{id}/speed")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> UpdateSpeed(int id, [FromBody] UpdateSpeedDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Speed))
                return BadRequest(ApiResponse<string>.Fail("السرعة مطلوبة"));

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var ok = await _radius.UpdateSpeed(client.Username, dto.Speed);
            if (!ok)
                return BadRequest(ApiResponse<string>.Fail("فشل تحديث السرعة في RADIUS"));

            var appliedRate = await _radius.GetRateLimit(client.Username);
            if (string.IsNullOrWhiteSpace(appliedRate))
                return StatusCode(500, ApiResponse<string>.Fail("لم يتم حفظ حد السرعة في RADIUS"));

            // لا يتبدل حد Mikrotik-Rate-Limit في جلسة PPP الموجودة. افصل
            // الجلسة من الراوتر الصحيح كي يعيد العميل المصادقة بالحد الجديد.
            bool kicked = false;
            try { kicked = await KickClientSession(client); }
            catch (Exception ex) { Console.WriteLine($"Kick after speed: {ex.Message}"); }

            await _audit.Log("UpdateSpeed", "Client", id);

            return Ok(ApiResponse<object>.Ok(new
            {
                message = kicked
                    ? "تم حفظ حد السرعة وفصل الجلسة — سيُعاد اتصال العميل بالسرعة الجديدة"
                    : "تم حفظ حد السرعة في RADIUS؛ لم تُكتشف جلسة PPP نشطة لفصلها",
                username = client.Username,
                requestedSpeed = dto.Speed,
                appliedRate,
                sessionKicked = kicked
            }));
        }

        // 🔑 إعادة تعيين كلمة المرور (وعرضها مرة واحدة)

        /// <summary>إحصاءات حية: استهلاك، IP، سرعات، عدد أجهزة تقريبي</summary>
        [HttpGet("{id}/live-stats")]
        public async Task<IActionResult> GetLiveStats(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var usage = await _radius.GetUserUsage(client.Username);
            var rateLimit = await _radius.GetRateLimit(client.Username);

            var sub = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.ClientId == id)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            string onlineIp = null;
            bool isOnline = false;
            long sessIn = 0, sessOut = 0;
            string uptime = null, callerId = null;
            long rxBps = 0, txBps = 0;
            string trafficIface = null;
            int arpCount = 0;

            try
            {
                var active = await GetActiveUsersForClient(client);
                var u = _mikroTik.FindActiveUser(active, client.Username);
                if (u != null)
                {
                    isOnline = true;
                    onlineIp = u.Address;
                    sessIn = u.BytesIn;
                    sessOut = u.BytesOut;
                    uptime = u.Uptime;
                    callerId = u.CallerId;
                    arpCount = await _mikroTik.CountArpNearAsync(u.Address);
                    var mon = await _mikroTik.TryMonitorTrafficAsync(client.Username);
                    rxBps = mon.rxBps;
                    txBps = mon.txBps;
                    trafficIface = mon.iface;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"live-stats mikrotik: {ex.Message}");
            }

            // إن لم يظهر من API → radacct
            if (!isOnline)
            {
                try
                {
                    var onlineMap = await _radius.GetOnlineUsers();
                    if (_radius.TryFindOnlineSession(onlineMap, client.Username, out var sess) && sess != null)
                    {
                        isOnline = true;
                        onlineIp = sess.FramedIp;
                        callerId = sess.MacAddress;
                        if (sess.StartTime.HasValue)
                        {
                            var span = DateTime.Now - sess.StartTime.Value;
                            uptime = $"{(int)span.TotalHours:D2}:{span.Minutes:D2}:{span.Seconds:D2}";
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"live-stats radacct: {ex.Message}");
                }
            }

            // تنسيق سرعات البت إلى نص مقروء
            string FmtBps(long bps)
            {
                double v = bps;
                string[] u = { "bps", "Kbps", "Mbps", "Gbps" };
                int i = 0;
                while (v >= 1000 && i < u.Length - 1) { v /= 1000; i++; }
                return $"{v:0.##} {u[i]}";
            }

            string FmtBytes(long b)
            {
                double v = b;
                string[] u = { "B", "KB", "MB", "GB", "TB" };
                int i = 0;
                while (v >= 1024 && i < u.Length - 1) { v /= 1024; i++; }
                return $"{v:0.##} {u[i]}";
            }

            // استهلاك الجلسة: MikroTik أولاً، ثم RADIUS accounting
            long radSessionIn = 0, radSessionOut = 0, radTotalIn = 0, radTotalOut = 0;
            try
            {
                // usage object من GetUserUsage
                var usageType = usage.GetType();
                radSessionIn = Convert.ToInt64(usageType.GetProperty("sessionInputBytes")?.GetValue(usage) ?? 0);
                radSessionOut = Convert.ToInt64(usageType.GetProperty("sessionOutputBytes")?.GetValue(usage) ?? 0);
                radTotalIn = Convert.ToInt64(usageType.GetProperty("totalInputBytes")?.GetValue(usage) ?? 0);
                radTotalOut = Convert.ToInt64(usageType.GetProperty("totalOutputBytes")?.GetValue(usage) ?? 0);
            }
            catch { /* ignore */ }

            long liveIn = sessIn > 0 ? sessIn : radSessionIn;
            long liveOut = sessOut > 0 ? sessOut : radSessionOut;
            long liveTotal = liveIn + liveOut;

            long grandIn = radTotalIn > 0 ? radTotalIn : liveIn;
            long grandOut = radTotalOut > 0 ? radTotalOut : liveOut;
            long grandTotal = grandIn + grandOut;
            // إن كان الإجمالي أقل من الجلسة (بيانات ناقصة) استخدم الجلسة
            if (grandTotal < liveTotal)
                grandTotal = liveTotal;

            return Ok(ApiResponse<object>.Ok(new
            {
                clientId = id,
                username = client.Username,
                isOnline,
                onlineIp,
                uptime,
                callerId,
                downloadBps = rxBps,
                uploadBps = txBps,
                downloadSpeed = FmtBps(rxBps),
                uploadSpeed = FmtBps(txBps),
                trafficInterface = trafficIface,
                configuredRate = rateLimit ?? sub?.Plan?.Speed,
                planSpeed = sub?.Plan?.Speed,
                // استهلاك الجلسة الحالية
                sessionBytesIn = liveIn,
                sessionBytesOut = liveOut,
                sessionBytesTotal = liveTotal,
                sessionUsageHuman = FmtBytes(liveTotal),
                sessionDownloadHuman = FmtBytes(liveIn),
                sessionUploadHuman = FmtBytes(liveOut),
                // الاستهلاك الكلي
                totalBytes = grandTotal,
                totalUsageHuman = FmtBytes(grandTotal),
                totalDownloadHuman = FmtBytes(grandIn),
                totalUploadHuman = FmtBytes(grandOut),
                usage,
                mikrotikBytesIn = sessIn,
                mikrotikBytesOut = sessOut,
                connectedDevicesEstimate = isOnline ? Math.Max(arpCount, 1) : 0,
                subscription = sub == null ? null : new
                {
                    sub.Id,
                    sub.StartDate,
                    sub.EndDate,
                    sub.IsActive,
                    PlanName = sub.Plan?.Name,
                    PlanSpeed = sub.Plan?.Speed
                }
            }));
        }

        /// <summary>Ping لراوتر/IP العميل عبر المايكروتيك</summary>
        [HttpPost("{id}/ping")]
        public async Task<IActionResult> PingClient(int id, [FromQuery] int count = 4)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            string ip = null;
            try
            {
                var active = await _mikroTik.GetActiveUsers();
                var u = _mikroTik.FindActiveUser(active, client.Username);
                ip = u?.Address;
            }
            catch { }

            if (string.IsNullOrEmpty(ip))
            {
                var online = await _radius.GetOnlineUsers();
                if (online.TryGetValue(client.Username, out var s))
                    ip = s.FramedIp;
            }

            if (string.IsNullOrEmpty(ip))
                return BadRequest(ApiResponse<string>.Fail("العميل غير متصل — لا يوجد IP لإجراء الـ Ping"));

            try
            {
                var result = await _mikroTik.PingAsync(ip, count);
                return Ok(ApiResponse<object>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail($"فشل الـ Ping: {ex.Message}"));
            }
        }

        /// <summary>تعديل تاريخ بداية ونهاية الاشتراك</summary>
        [HttpPut("{id}/subscription-dates")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> UpdateSubscriptionDates(int id, [FromBody] UpdateSubscriptionDatesDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات فارغة"));

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var sub = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.ClientId == id)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            if (sub == null)
                return BadRequest(ApiResponse<string>.Fail("لا يوجد اشتراك لهذا العميل"));

            if (dto.StartDate.HasValue)
                sub.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue)
                sub.EndDate = dto.EndDate.Value;

            if (sub.EndDate < sub.StartDate)
                return BadRequest(ApiResponse<string>.Fail("تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية"));

            sub.IsActive = sub.EndDate > DateTime.Now;
            sub.Status = sub.IsActive ? "Active" : "Expired";

            await _context.SaveChangesAsync();

            // مزامنة RADIUS
            await _radius.UpdateExpiration(client.Username, sub.EndDate);
            if (sub.IsActive)
            {
                await _radius.EnableUser(client.Username);
                if (client.Status != "Active")
                {
                    client.Status = "Active";
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                await _radius.DisableUser(client.Username);
                try { await KickClientSession(client); } catch { }
                client.Status = "Suspended";
                await _context.SaveChangesAsync();
            }

            await _audit.Log("UpdateSubscriptionDates", "Client", id);

            return Ok(ApiResponse<object>.Ok(new
            {
                message = "تم تحديث تواريخ الاشتراك",
                startDate = sub.StartDate,
                endDate = sub.EndDate,
                isActive = sub.IsActive
            }));
        }


        /// <summary>عرض كلمة مرور العميل من RADIUS (Cleartext-Password) — للأدمن فقط</summary>
        [HttpGet("{id}/password")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> GetPassword(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var clear = await _radius.GetCleartextPassword(client.Username);
            if (string.IsNullOrEmpty(clear))
                return NotFound(ApiResponse<string>.Fail("لم يتم العثور على كلمة مرور في RADIUS لهذا المستخدم"));

            await _audit.Log("ViewPassword", "Client", id);

            return Ok(ApiResponse<object>.Ok(new
            {
                clientId = id,
                username = client.Username,
                password = clear
            }));
        }

        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var client = await _context.Clients
                .Include(c => c.Subscriptions.Where(s => s.IsActive))
                .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var newPassword = ISPSystem.Helpers.RandomPasswordService.GeneratePassword(5);
            client.Password = _password.Hash(newPassword);
            await _context.SaveChangesAsync();

            // جلب السرعة وتاريخ الانتهاء الحاليين
            var activeSub = client.Subscriptions?
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefault();

            string speed = activeSub?.Plan?.Speed ?? "1M/1M";
            speed = speed.Replace("Mb/s", "M").Replace("Mbps", "M").Trim();
            if (!speed.Contains("/")) speed = $"{speed}/{speed}";

            DateTime? expiration = activeSub?.EndDate;

            // إعادة إنشاء المستخدم في RADIUS بالباسورد الجديد
            var radiusOk = await _radius.CreateUser(
                client.Username,
                newPassword,
                speed,
                expiration
            );

            await _audit.Log("ResetPassword", "Client", id);

            return Ok(ApiResponse<object>.Ok(new
            {
                message = "تم إعادة تعيين كلمة المرور بنجاح",
                username = client.Username,
                password = newPassword, // تظهر مرة واحدة فقط
                radiusUpdated = radiusOk
            }));
        }

        // ❌ حذف بسيط (من قاعدة البيانات فقط)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            await _radius.DisableUser(client.Username);

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            await _audit.Log("Delete", "Client", id);

            return Ok(ApiResponse<string>.Ok("تم حذف العميل بنجاح"));
        }

        // 🗑️ حذف نهائي (من النظام + RADIUS + كل السجلات المرتبطة)
        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePermanent(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return NotFound(ApiResponse<string>.Fail("العميل غير موجود"));

            var username = client.Username;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. حذف من RADIUS نهائياً
                var radiusDeleted = await _radius.DeleteUser(username);

                // 2. حذف كل السجلات المرتبطة (حسب ترتيب الاعتماديات)
                var payments = _context.Payments.Where(p => p.ClientId == id);
                _context.Payments.RemoveRange(payments);

                var invoices = _context.Invoices.Where(i => i.ClientId == id);
                _context.Invoices.RemoveRange(invoices);

                var subscriptions = _context.Subscriptions.Where(s => s.ClientId == id);
                _context.Subscriptions.RemoveRange(subscriptions);

                // إذا كان لديك جداول أخرى مرتبطة (Tickets / Devices) أضفها هنا:
                // var tickets = _context.Tickets.Where(t => t.ClientId == id);
                // _context.Tickets.RemoveRange(tickets);

                // 3. حذف العميل
                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                await _audit.Log("DeletePermanent", "Client", id);

                return Ok(ApiResponse<object>.Ok(new
                {
                    message = "تم حذف العميل نهائياً من النظام وRADIUS",
                    radiusDeleted
                }));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ApiResponse<string>.Fail($"فشل الحذف النهائي: {ex.Message}"));
            }
        }

        /// <summary>فصل جلسة العميل من الراوتر المرتبط به (MikroTikServerId) أو الافتراضي</summary>
        private async Task<bool> KickClientSession(Client client)
        {
            if (client == null || string.IsNullOrWhiteSpace(client.Username))
                return false;
            try
            {
                if (client.MikroTikServerId.HasValue && client.MikroTikServerId.Value > 0)
                {
                    var kickedFromAssignedRouter = await _mikroTik.KickActiveUserByDeviceId(
                        client.Username,
                        client.MikroTikServerId.Value);
                    if (kickedFromAssignedRouter)
                        return true;
                }

                // العميل القديم أو ذو الربط الخاطئ: حدّد جلسة PPP أولاً ثم افصلها
                // من الراوتر الذي توجد عليه، بدلاً من افتراض الراوتر الافتراضي.
                return await _mikroTik.KickActiveUserAcrossDevices(client.Username);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"KickClientSession {client.Username}: {ex.Message}");
                return false;
            }
        }

        /// <summary>جلب النشطين من راوتر العميل أو كل الأجهزة عند الحاجة.</summary>
        private async Task<List<ActiveUser>> GetActiveUsersForClient(Client client)
        {
            // تُستخدم خصائص MikroTikDeviceId في ActiveUser لاختيار الراوتر
            // للعمليات اللاحقة؛ وتُعاد القائمة الكاملة لاكتشاف العملاء القدامى
            // أو ذوي الربط المخزّن الخاطئ.
            var snapshot = await _mikroTik.GetCachedActiveUsersSnapshotAsync();
            return snapshot.Users;
        }

    }
}