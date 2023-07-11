using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using webapi.Utils;
using webapi.Entities;
using static webapi.Controllers.AuthController;

namespace webapi.Hubs
{
    
    [EnableCors("CORS")]
    [Authorize]
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
            //await Test();
            var u = JSONConvertor.ChatDataJson(await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == username.ToString().ToUpper()),db);
            await Clients.Client(Context.ConnectionId).SendAsync("Tset", u);
            await Clients.Client(Context.ConnectionId).SendAsync("ConnectedUsers", connectedUserList);
            await base.OnConnectedAsync();
        }

        public async Task SearchChats(string userInput)
        {
            var username = connectedUsers[Context.ConnectionId];
            var user = db.Users.Include(u=>u.Dialogs).FirstOrDefault(u => u.Id.ToString() == username.ToString().ToUpper());
            await Clients.Client(Context.ConnectionId).SendAsync("chatsSearched", JSONConvertor.UserSearchJson(user,userInput,db));
        }


        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var username = connectedUsers[Context.ConnectionId];
            connectedUsers.Remove(Context.ConnectionId);
            await Clients.Others.SendAsync("UserDisconnected", username);
            await base.OnDisconnectedAsync(exception);
        }

        private async Task Test()
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Name == "Tom");
            var user1 = await db.Users.FirstOrDefaultAsync(u => u.Name == "Bob");

            var dialog = new Dialog { User1 = user, User2 = user1 };
            await db.Dialogs.AddAsync(dialog);

            var message = new Message { Content = "sdgoikjsdfkgjd", Sender = user1 };
            dialog.Messages.Add(message);

            var gr = await db.Groups.FirstOrDefaultAsync(g => g.Title == "uihui1");
            gr.Users.Add(user);

            await db.SaveChangesAsync();
        }
    }

}
