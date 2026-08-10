using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Models;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Services;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    [Authorize] // 🔐 تأمين مسارات الاشتراكات لمنع الوصول غير المصرح به
    public class SubscriptionsController : ControllerBase
    {
        private readonly SubscriptionService _service;

        public SubscriptionsController(SubscriptionService service)
        {
            _service = service;
        }

        // ➕ إنشاء اشتراك إنترنت جديد لعميل
        [HttpPost]
        [Authorize(Roles = "Admin,Support,SalesPerson")] // تقييد الصلاحيات للموظفين المعنيين بالدعم والمبيعات
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات طلب الاشتراك غير صالحة"));

            try
            {
                // إنشاء الاشتراك وحساب تواريخ البداية والنهاية بناءً على الباقة والأيام
                var sub = await _service.Subscribe(dto.UserId, dto.PlanId, dto.Days);
                return Ok(ApiResponse<Subscription>.Ok(sub));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 📋 جلب كافة الاشتراكات المسجلة في النظام (معالجة غير حاصرة لـ Threads)
        [HttpGet]
        [Authorize(Roles = "Admin,Support,Accountant")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                // ⚡ إصلاح: تحويل الجلب إلى Async لحماية أداء السيرفر من الـ Blocking
                var subscriptions = await _service.GetAll();
                return Ok(ApiResponse<IEnumerable<Subscription>>.Ok(subscriptions));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🆔 جلب تفاصيل اشتراك محدد بواسطة المعرف
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var sub = await _service.GetById(id);
            if (sub == null)
                return NotFound(ApiResponse<string>.Fail("الاشتراك المطلوب غير موجود في النظام"));

            return Ok(ApiResponse<Subscription>.Ok(sub));
        }

        // 🔄 تحديث بيانات اشتراك قائم (تعديل التواريخ أو الباقة)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSubscriptionDto dto)
        {
            if (dto == null)
                return BadRequest(ApiResponse<string>.Fail("بيانات التحديث المرسلة فارغة"));

            try
            {
                var sub = await _service.Update(id, dto);
                if (sub == null)
                    return NotFound(ApiResponse<string>.Fail("الاشتراك المطلوب غير موجود لتحديثه"));

                return Ok(ApiResponse<Subscription>.Ok(sub));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}