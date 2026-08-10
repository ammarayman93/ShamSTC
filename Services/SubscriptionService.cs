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

            var sub = new Subscription
            {
                ClientId = clientId,
                PlanId = planId,
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddDays(days),
                IsActive = true,
                Status = "Active",
                PaidAmount = plan.Price
            };

            _context.Subscriptions.Add(sub);
            await _context.SaveChangesAsync();

            return sub;
        }

        public async Task<List<Subscription>> GetAll()
        {
            return await _context.Subscriptions
                .Include(s => s.Client)
                .Include(s => s.Plan)
                .ToListAsync();
        }

        // تمديد اشتراك (مع إمكانية تغيير الباقة/السرعة)
        public async Task<Subscription> Renew(int clientId, int? newPlanId = null)
        {
            var sub = await _context.Subscriptions
                .Include(x => x.Plan)
                .Where(x => x.ClientId == clientId)
                .OrderByDescending(x => x.EndDate)
                .FirstOrDefaultAsync();

            if (sub == null)
                throw new Exception("Subscription not found");

            // تغيير الباقة إن طُلب
            if (newPlanId.HasValue && newPlanId.Value > 0 && newPlanId.Value != sub.PlanId)
            {
                var newPlan = await _context.Plans.FindAsync(newPlanId.Value);
                if (newPlan == null)
                    throw new Exception("الباقة الجديدة غير موجودة");

                sub.PlanId = newPlan.Id;
                sub.Plan = newPlan;
            }

            // إعادة تحميل الخطة بعد التغيير
            if (sub.Plan == null)
                await _context.Entry(sub).Reference(s => s.Plan).LoadAsync();

            var duration = sub.Plan?.DurationDays ?? 30;

            sub.EndDate = sub.EndDate > DateTime.Now
                ? sub.EndDate.AddDays(duration)
                : DateTime.Now.AddDays(duration);

            sub.IsActive = true;
            sub.Status = "Active";
            sub.RenewedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            // تأكد من تحميل الخطة للرد
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
            sub.ClientId = dto.UserId;  // UserId في الـ DTO هو ClientId
            sub.StartDate = DateTime.Now;
            sub.EndDate = DateTime.Now.AddDays(dto.Days);
            sub.IsActive = true;

            await _context.SaveChangesAsync();
            return sub;
        }
    }
}