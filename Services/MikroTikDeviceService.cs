using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ISPSystem.Services
{
    public class MikroTikDeviceService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MikroTikDeviceService> _logger;

        public MikroTikDeviceService(AppDbContext context, ILogger<MikroTikDeviceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<MikroTikDevice>> GetAll()
        {
            return await _context.MikroTikDevices
                .OrderBy(d => d.Region)
                .ThenBy(d => d.Name)
                .ToListAsync();
        }

        /// <summary>تجميع السيرفرات حسب المنطقة للوحة التحكم</summary>
        public async Task<object> GetGroupedByRegion()
        {
            var devices = await GetAll();
            var groups = devices
                .GroupBy(d => string.IsNullOrWhiteSpace(d.Region) ? "بدون منطقة" : d.Region)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    region = g.Key,
                    total = g.Count(),
                    online = g.Count(x => x.IsOnline || x.Status == "Online"),
                    offline = g.Count(x => !x.IsOnline && x.Status != "Online"),
                    servers = g.Select(d => new
                    {
                        d.Id,
                        d.Name,
                        d.Region,
                        d.IpAddress,
                        d.VpnIp,
                        d.PublicIp,
                        d.ApiPort,
                        d.IsEnabled,
                        d.IsOnline,
                        status = string.IsNullOrEmpty(d.Status)
                            ? (d.IsOnline ? "Online" : "Offline")
                            : d.Status,
                        d.LastCheckedAt,
                        d.LastError,
                        d.Location
                    }).ToList()
                })
                .ToList();

            return new
            {
                totalServers = devices.Count,
                onlineServers = devices.Count(d => d.IsOnline || d.Status == "Online"),
                regions = groups
            };
        }

        public async Task<MikroTikDevice> GetById(int id)
        {
            return await _context.MikroTikDevices.FindAsync(id);
        }

        public async Task<MikroTikDevice> Create(MikroTikDevice device)
        {
            if (string.IsNullOrWhiteSpace(device.ConnectionType))
                device.ConnectionType = "L2TP";
            device.CreatedAt = DateTime.Now;
            device.IsOnline = false;
            device.Status = "Unknown";

            if (string.IsNullOrWhiteSpace(device.VpnIp) && !string.IsNullOrWhiteSpace(device.IpAddress))
                device.VpnIp = device.IpAddress;
            if (string.IsNullOrWhiteSpace(device.IpAddress) && !string.IsNullOrWhiteSpace(device.VpnIp))
                device.IpAddress = device.VpnIp;

            _context.MikroTikDevices.Add(device);
            await _context.SaveChangesAsync();
            return device;
        }

        public async Task<MikroTikDevice> Update(int id, MikroTikDevice dto)
        {
            var device = await _context.MikroTikDevices.FindAsync(id);
            if (device == null) return null;

            device.Name = dto.Name;
            device.Region = dto.Region;
            device.IpAddress = dto.IpAddress;
            device.VpnIp = string.IsNullOrWhiteSpace(dto.VpnIp) ? dto.IpAddress : dto.VpnIp;
            device.PublicIp = dto.PublicIp;
            device.Username = dto.Username;
            if (!string.IsNullOrEmpty(dto.Password))
                device.Password = dto.Password;
            device.ApiPort = dto.ApiPort > 0 ? dto.ApiPort : device.ApiPort;
            if (dto.RadiusSecret != null)
                device.RadiusSecret = dto.RadiusSecret;
            device.IsEnabled = dto.IsEnabled;
            device.Location = dto.Location;
            device.Notes = dto.Notes;
            if (!string.IsNullOrWhiteSpace(dto.ConnectionType))
                device.ConnectionType = dto.ConnectionType;

            await _context.SaveChangesAsync();
            return device;
        }

        public async Task<bool> Delete(int id)
        {
            var device = await _context.MikroTikDevices.FindAsync(id);
            if (device == null) return false;

            var linked = await _context.Clients.CountAsync(c => c.MikroTikServerId == id);
            if (linked > 0)
                throw new Exception($"لا يمكن الحذف: يوجد {linked} عميل مرتبط بهذا السيرفر. انقل العملاء أولاً.");

            _context.MikroTikDevices.Remove(device);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MikroTikDevice> CheckConnection(int id)
        {
            var device = await _context.MikroTikDevices.FindAsync(id);
            if (device == null) return null;

            await ProbeAsync(device);
            await _context.SaveChangesAsync();
            return device;
        }

        public async Task<List<MikroTikDevice>> CheckAllConnections()
        {
            var devices = await _context.MikroTikDevices
                .Where(d => d.IsEnabled)
                .ToListAsync();

            foreach (var d in devices)
                await ProbeAsync(d);

            await _context.SaveChangesAsync();
            return devices;
        }

        private async Task ProbeAsync(MikroTikDevice device)
        {
            var host = !string.IsNullOrWhiteSpace(device.VpnIp) ? device.VpnIp : device.IpAddress;
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                using var client = new TcpClient();
                await client.ConnectAsync(host, device.ApiPort, cts.Token);
                device.IsOnline = true;
                device.Status = "Online";
                device.LastError = null;
            }
            catch (Exception ex)
            {
                device.IsOnline = false;
                device.Status = "Offline";
                device.LastError = ex.Message;
                _logger.LogWarning("MikroTik {Name} ({Host}:{Port}) offline: {Msg}",
                    device.Name, host, device.ApiPort, ex.Message);
            }
            device.LastCheckedAt = DateTime.Now;
        }
    }
}
