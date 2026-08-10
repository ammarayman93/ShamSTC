using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.Models;
using ISPSystem.Helpers;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/settings")]
    [Authorize(Roles = "Admin")] // 🔐 الإعدادات العامة للنظام محصورة بالكامل للمدير التنفيذي
    public class SystemSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SystemSettingsController(AppDbContext context)
        {
            _context = context;
        }

        // 📋 جلب كافة إعدادات النظام (مثل إعدادات سيرفرات ميكروتيك، بوابات الدفع، والـ API Keys)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var settings = await _context.SystemSettings.ToListAsync();
            return Ok(ApiResponse<List<SystemSetting>>.Ok(settings));
        }

        // 🔑 جلب قيمة إعداد معين بواسطة المفتاح الخاص به
        [HttpGet("{key}")]
        public async Task<IActionResult> GetByKey(string key)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);

            // 🛠️ إصلاح: إرجاع 404 بدلاً من 200 في حال عدم وجود المفتاح
            if (setting == null)
                return NotFound(ApiResponse<string>.Fail($"مفتاح الإعداد '{key}' غير موجود في النظام"));

            return Ok(ApiResponse<SystemSetting>.Ok(setting));
        }

        // 🔄 تحديث أو إنشاء (Upsert) إعداد في النظام
        [HttpPut("{key}")]
        public async Task<IActionResult> Update(string key, [FromBody] UpdateSettingDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة غير صالحة"));

            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);

            if (setting == null)
            {
                // في حال عدم وجود الإعداد، يتم إنشاؤه من جديد بالكامل
                setting = new SystemSetting
                {
                    Key = key,
                    Value = dto.Value,
                    Group = dto.Group ?? "General"
                };
                _context.SystemSettings.Add(setting);
            }
            else
            {
                // في حال وجوده، يتم تحديث القيمة والمجموعة معاً
                setting.Value = dto.Value;
                if (!string.IsNullOrEmpty(dto.Group))
                {
                    setting.Group = dto.Group;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok($"تم حفظ وتحديث الإعداد '{key}' بنجاح في النظام"));
        }
    }

    // 🗂️ نموذج البيانات الخاص بنقل وتحديث الإعدادات
    public class UpdateSettingDto
    {
        public string Value { get; set; }
        public string Group { get; set; }
    }
}