using Microsoft.AspNetCore.SignalR;
using ISPSystem.Hubs;
using System.Threading.Tasks;

namespace ISPSystem.Services
{
    public class NotificationSender
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationSender(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUser(string userId, string title, string message, string type)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new
            {
                Id = System.Guid.NewGuid().ToString(),
                Title = title,
                Message = message,
                Type = type,
                Time = System.DateTime.Now.ToString("HH:mm"),
                Read = false
            });
        }

        public async Task SendToAll(string title, string message, string type)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
            {
                Id = System.Guid.NewGuid().ToString(),
                Title = title,
                Message = message,
                Type = type,
                Time = System.DateTime.Now.ToString("HH:mm"),
                Read = false
            });
        }
    }
}