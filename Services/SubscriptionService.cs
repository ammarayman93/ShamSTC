using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class SubscriptionService
    {
        private readonly AppDbContext _context;

        public SubscriptionService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// نهاية الاشتراك دائماً الساعة 12:00 ظهراً في يوم الانتهاء
        /// </summary>
        public static DateTime EndAtNoon(DateTime from, int days)
        {
            if (days < 1) days = 1;
            // من تاريخ اليوم + الأيام، الساعة 12 ظهراً
            return from.Date.AddDays(days).AddHours(12);
        }

        public static DateTime ExtendEndAtNoon(DateTime currentEnd, int days)
        {
            if (days < 1) days = 1;
            var baseDate = currentEnd > DateTime.Now ? currentEnd.Date : DateTime.Now.Date;
            return baseDate.AddDays(days).AddHours(12);
        }

        // إنشاء اشتراك جديد
        public async Task<Subscription> Subscribe(int clientId, int planId, int? customDays = null)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client == null)
                throw new Exception("Client not found");

            var plan = await _context.Plans.FindAsync(planId);
            if (plan == null)
                throw new Exception("Plan not found");

            var days = customDays ?? plan.DurationDays;
            if (days < 1) days = 1;

            var sub = new Subscription
            {
                ClientId = clientId,
                PlanId = planId,
                StartDate = DateTime.Now,
                EndDate = EndAtNoon(DateTime.Now, days),
                IsActive = true,
                Status = "Active",
                PaidAmount = plan.Price
            };

            _context.Subscriptions.Add(sub);
            await _context.SaveChangesAsync();

            await _context.Entry(sub).Reference(s => s.Plan).LoadAsync();
            return sub;
        }

        public async Task<List<Subscription>> GetAll()
        {
            return await _context.Subscriptions
                .Include(s => s.Client)
                .Include(s => s.Plan)
                .ToListAsync();
        }

        /// <summary>
        /// تجديد الاشتراك مع إمكانية اختيار باقة (سرعة) جديدة.
        /// نهاية الاشتراك تُضبط على الساعة 12:00 ظهراً.
        /// </summary>
        public async Task<Subscription> Renew(int clientId, int? newPlanId = null)
        {
            var sub = await _context.Subscriptions
                .Include(x => x.Plan)
                .Where(x => x.ClientId == clientId)
                .OrderByDescending(x => x.EndDate)
                .FirstOrDefaultAsync();

            if (sub == null)
            {
                // لا يوجد اشتراك سابق — إنشاء واحد جديد إن وُجدت باقة
                if (!newPlanId.HasValue || newPlanId.Value <= 0)
                    throw new Exception("لا يوجد اشتراك سابق — يجب اختيار باقة للتفعيل");

                return await Subscribe(clientId, newPlanId.Value);
            }

            // تغيير الباقة إن طُلب
            if (newPlanId.HasValue && newPlanId.Value > 0 && newPlanId.Value != sub.PlanId)
            {
                var newPlan = await _context.Plans.FindAsync(newPlanId.Value);
                if (newPlan == null)
                    throw new Exception("الباقة الجديدة غير موجودة");

                sub.PlanId = newPlan.Id;
                sub.Plan = newPlan;
            }

            if (sub.Plan == null)
                await _context.Entry(sub).Reference(s => s.Plan).LoadAsync();

            var duration = sub.Plan?.DurationDays ?? 30;
            if (duration < 1) duration = 30;

            sub.EndDate = ExtendEndAtNoon(sub.EndDate, duration);
            sub.IsActive = true;
            sub.Status = "Active";
            sub.RenewedAt = DateTime.Now;
            if (sub.Plan != null)
                sub.PaidAmount = sub.Plan.Price;

            await _context.SaveChangesAsync();
            await _context.Entry(sub).Reference(s => s.Plan).LoadAsync();
            return sub;
        }

        public async Task<Subscription> GetById(int id)
        {
            return await _context.Subscriptions
                .Include(s => s.Client)
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Subscription> Update(int id, UpdateSubscriptionDto dto)
        {
            var sub = await _context.Subscriptions.FindAsync(id);
            if (sub == null)
                return null;

            sub.PlanId = dto.PlanId;
            sub.ClientId = dto.UserId;
            sub.StartDate = DateTime.Now;
            sub.EndDate = EndAtNoon(DateTime.Now, dto.Days > 0 ? dto.Days : 30);
            sub.IsActive = true;

            await _context.SaveChangesAsync();
            return sub;
        }
    }
}
