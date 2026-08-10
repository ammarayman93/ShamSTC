using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Services;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")] // 🔐 حماية كاملة: إدارة حسابات الموظفين وصلاحياتهم محصورة بالـ Admin فقط
    public class UsersController : ControllerBase
    {
        private readonly UserService _service;


        public UsersController(UserService service)
        {
            _service = service;
        }
        // 👥 عرض كل المستخدمين والموظفين في النظام مع دعم الفلترة (Async)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] UserQuery query)
        {
            try
            {
                // تأمين قيم افتراضية لضمان عدم حدوث خطأ تقسيم
                if (query.Page <= 0) query.Page = 1;
                if (query.PageSize <= 0) query.PageSize = 10;

                // استدعاء الدالة بعد تحويلها لـ Async بنجاح
                var result = await _service.GetAll(query);
                return Ok(ApiResponse<object>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🆔 عرض بيانات موظف محدد بواسطة المعرف الخاص به
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _service.GetById(id);
            if (user == null)
                return NotFound(ApiResponse<string>.Fail("المستخدم المطلوب غير موجود في النظام"));

            return Ok(ApiResponse<User>.Ok(user));
        }

        // ➕ إضافة مستخدم أو موظف جديد إلى النظام (الدعم الفني، المبيعات، المحاسبة)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("البيانات المرسلة لإنشاء المستخدم غير صالحة"));

            try
            {
                var user = await _service.Create(dto);
                return Ok(ApiResponse<User>.Ok(user));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🔄 تعديل بيانات موظف قائم (تحديث الصلاحيات، الاسم، أو حالة الحساب)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات التحديث المرسلة فارغة"));

            var user = await _service.Update(id, dto);
            if (user == null)
                return NotFound(ApiResponse<string>.Fail("المستخدم المطلوب غير موجود لتعديله"));

            return Ok(ApiResponse<User>.Ok(user));
        }

        // ❌ حذف حساب موظف من النظام
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
            if (!result)
                return NotFound(ApiResponse<string>.Fail("المستخدم المطلوب غير موجود لحذفه"));

            return Ok(ApiResponse<string>.Ok("تم حذف حساب الموظف وتجريده من صلاحيات النظام بنجاح"));
        }
    }
}