using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using webapi.Entities;

namespace webapi.Hubs
{
    [Authorize]
    [EnableCors("CORS")]
    public class ChatHub:Hub
    {
        private ApplicationContext db;
        private static Dictionary<string, string> connectedUsers = new Dictionary<string, string>();

        public ChatHub(ApplicationContext db)
        {
            this.db = db;
        }
        
        public override async Task OnConnectedAsync()
        {
            var username = Context.GetHttpContext().Request.Query["username"];
            connectedUsers[Context.ConnectionId] = username;
            await Clients.Others.SendAsync("UserConnected", username);
            var connectedUserList = connectedUsers.Values.ToList();
            await Clients.Client(Context.ConnectionId).SendAsync("ConnectedUsers", connectedUserList);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var username = connectedUsers[Context.ConnectionId];
            connectedUsers.Remove(Context.ConnectionId);
            await Clients.Others.SendAsync("UserDisconnected", username);
            await base.OnDisconnectedAsync(exception);
        }
    }

}
