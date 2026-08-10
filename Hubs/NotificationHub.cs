using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ISPSystem.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendNotification(string userId, string title, string message, string type)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", new
            {
                Id = System.Guid.NewGuid().ToString(),
                Title = title,
                Message = message,
                Type = type,
                Time = System.DateTime.Now.ToString("HH:mm"),
                Read = false
            });
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await JoinGroup($"user_{userId}");
            }
            await base.OnConnectedAsync();
        }
    }
}