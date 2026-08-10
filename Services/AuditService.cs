using System;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.Models;
using Microsoft.AspNetCore.Http;

namespace ISPSystem.Services
{
    public class AuditService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _http;

        public AuditService(AppDbContext context, IHttpContextAccessor http)
        {
            _context = context;
            _http = http;
        }

        public async Task Log(string action, string entity, int entityId)
        {
            var username = _http.HttpContext?.User?.Identity?.Name ?? "Unknown";
            var ip = _http.HttpContext?.Connection?.RemoteIpAddress?.ToString();

            var log = new AuditLog
            {
                Action = action,
                Entity = entity,
                EntityId = entityId,
                Username = username,
                IPAddress = ip,
                Date = DateTime.Now
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}