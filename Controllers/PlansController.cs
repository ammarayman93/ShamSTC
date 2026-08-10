using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ISPSystem.Data;
using ISPSystem.Models;
using ISPSystem.Services;
using ISPSystem.Helpers;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/plans")]
    [Authorize]
    public class PlansController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public PlansController(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        // 📋 الحصول على جميع الباقات مرتبة حسب رغبة العرض
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var plans = await _context.Plans
                .OrderBy(p => p.SortOrder)
                .ToListAsync();

            return Ok(ApiResponse<List<Plan>>.Ok(plans));
        }

        // 🆔 الحصول على باقة محددة بواسطة المعرف
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _context.Plans.FindAsync(id);
            if (plan == null)
                return NotFound(ApiResponse<string>.Fail("الباقة المطلوبة غير موجودة"));

            return Ok(ApiResponse<Plan>.Ok(plan));
        }

        // ➕ إضافة باقة إنترنت جديدة (صلاحية Admin فقط)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Plan plan)
        {
            if (plan == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة غير صالحة"));

            // التحقق من صحة البيانات الأساسية
            if (string.IsNullOrEmpty(plan.Name))
                return BadRequest(ApiResponse<string>.Fail("اسم الباقة مطلوب"));

            if (plan.Price <= 0)
                return BadRequest(ApiResponse<string>.Fail("السعر يجب أن يكون أكبر من صفر"));

            if (plan.DurationDays <= 0)
                return BadRequest(ApiResponse<string>.Fail("المدة الزمنية للباقة يجب أن تكون أكبر من صفر"));

            // تعيين ترتيب افتراضي تلقائي متسلسل في قاعدة البيانات
            var maxOrder = await _context.Plans.MaxAsync(p => (int?)p.SortOrder) ?? 0;
            plan.SortOrder = maxOrder + 1;
            plan.IsActive = true;

            _context.Plans.Add(plan);
            await _context.SaveChangesAsync();

            // 📝 تسجيل العملية في سجل النظام
            await _audit.Log("Create", "Plan", plan.Id);

            return Ok(ApiResponse<Plan>.Ok(plan));
        }

        // 🔄 تعديل بيانات باقة الحالية (صلاحية Admin فقط)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Plan updatedPlan)
        {
            if (updatedPlan == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة فارغة"));

            var plan = await _context.Plans.FindAsync(id);
            if (plan == null)
                return NotFound(ApiResponse<string>.Fail("الباقة المطلوبة غير موجودة"));

            // تحديث الحقول الأساسية
            plan.Name = updatedPlan.Name;
            plan.Speed = updatedPlan.Speed;
            plan.Price = updatedPlan.Price;
            plan.DurationDays = updatedPlan.DurationDays;
            plan.Description = updatedPlan.Description;
            plan.IsActive = updatedPlan.IsActive;
            plan.SortOrder = updatedPlan.SortOrder;

            try
            {
                await _context.SaveChangesAsync();
                await _audit.Log("Update", "Plan", id);

                return Ok(ApiResponse<Plan>.Ok(plan));
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail($"حدث خطأ أثناء حفظ التعديلات: {ex.Message}"));
            }
        }

        // ❌ حذف باقة من النظام مع التحقق من الارتباطات
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var plan = await _context.Plans.FindAsync(id);
            if (plan == null)
                return NotFound(ApiResponse<string>.Fail("الباقة المطلوبة غير موجودة"));

            // 🛡️ فحص الأمان: منع حذف الباقة في حال وجود مستخدمين مشتركين بها حالياً لمنع تكسر البيانات (Integrity Constraint)
            var hasSubscriptions = await _context.Subscriptions.AnyAsync(s => s.PlanId == id);
            if (hasSubscriptions)
                return BadRequest(ApiResponse<string>.Fail("لا يمكن حذف الباقة، توجد اشتراكات نشطة أو سابقة مرتبطة بها. يمكنك إلغاء تفعيلها بدلاً من الحذف"));

            _context.Plans.Remove(plan);
            await _context.SaveChangesAsync();

            await _audit.Log("Delete", "Plan", id);

            return Ok(ApiResponse<string>.Ok("تم حذف الباقة بنجاح من النظام"));
        }
    }
}