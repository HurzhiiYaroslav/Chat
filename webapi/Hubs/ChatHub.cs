using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using webapi.Utils;
using webapi.Entities;
using System.Text.Json.Nodes;
using System.Runtime.Intrinsics.X86;
using System;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Identity;

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
            await Test();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == username.ToString().ToUpper());
            if (user != null) { 

            List<Chat> groupNames = db.GetChatsForUser(user);
            await AddUserToGroups(Context.ConnectionId,groupNames);
            var connectedUserList = connectedUsers.Values.ToList();
            var u = JSONConvertor.ChatDataJson(user,db);
            await Clients.Client(Context.ConnectionId).SendAsync("UserData", u);
            await Clients.Client(Context.ConnectionId).SendAsync("ConnectedUsers", connectedUserList);
            }
            else
            {
                await Clients.Client(Context.ConnectionId).SendAsync("Relogin");
            }
            await base.OnConnectedAsync();
        }

        public async Task AddUserToGroups(string userId, List<Chat> chats)
        {
            var tasks = chats.Select(chat => Groups.AddToGroupAsync(userId, chat.Id.ToString()));
            await Task.WhenAll(tasks);
        }

        public async Task SearchChats(string userInput)
        {
            var username = connectedUsers[Context.ConnectionId];
            var user = db.Users.Include(u=>u.Dialogs).FirstOrDefault(u => u.Id.ToString() == username.ToString().ToUpper());
            await Clients.Client(Context.ConnectionId).SendAsync("chatsSearched", JSONConvertor.UserSearchJson(user,userInput,db));
        }

        public async Task CreateDialog(string companionId)
        {
            var userId = connectedUsers[Context.ConnectionId];
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId.ToUpper());
            var companion = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == companionId.ToUpper());

            if (companion == null)
            {
                Console.WriteLine($"Companion user with ID '{companionId}' not found in the database.");
                return;
            }

            if(await db.Dialogs.AnyAsync(d => (d.User1 == user && d.User2 == companion)||(d.User1 == companion && d.User2 == user)))
            {
                await Clients.Client(Context.ConnectionId).SendAsync("setError", "Dailog already exist");
                return;
            }

            try
            {
                var dialog = new Dialog { User1 = user, User2 = companion };
                await db.Dialogs.AddAsync(dialog);
                await db.SaveChangesAsync();
                await Groups.AddToGroupAsync(Context.ConnectionId, dialog.Id.ToString());

                string CompanionConnection = connectedUsers.FirstOrDefault(x => x.Value == companionId).Key;
                if (CompanionConnection != null)
                {
                    await Groups.AddToGroupAsync(CompanionConnection, dialog.Id.ToString());
                    await Clients.Client(CompanionConnection).SendAsync("newChat", JSONConvertor.DialogToJObject(dialog, companion).ToString());
                }
                await Clients.Client(Context.ConnectionId).SendAsync("newChat", JSONConvertor.DialogToJObject(dialog,user).ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex}");
            }
        }

        public async Task Invite(string userToInviteId,string roomId )
        {
            var userId = connectedUsers[Context.ConnectionId];
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId.ToUpper());
            var room = await db.Groups.FirstOrDefaultAsync(g => g.Id.ToString() == roomId.ToUpper());
            var invitedUser =await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userToInviteId.ToUpper());
            if (invitedUser != null && room!=null)
            {
                room.Users.Add(invitedUser);
                await db.SaveChangesAsync();
                var jObject = new JObject();
                jObject["chatId"] = roomId;
                jObject["User"] = JSONConvertor.userToJObject(invitedUser);
                await Clients.Group(roomId).SendAsync("newMember",jObject.ToString());
                await Clients.Group(roomId).SendAsync("newChat", JSONConvertor.GroupToJObject(room));
                return;
            }
            else
            {
                await Clients.Client(Context.ConnectionId).SendAsync("setError", "Something went wrong");
                return;
            };
        }

        public async Task Leave(string chatId)
        {
            var userId = connectedUsers[Context.ConnectionId];
            var user = await db.Users.Include(u=>u.Groups).FirstOrDefaultAsync(u => u.Id.ToString() == userId.ToUpper());
            var chat = await db.Groups.Include(g => g.Users).FirstOrDefaultAsync(g => g.Id.ToString() == chatId.ToUpper());
            if (user != null && chat != null) {
                chat.Users.Remove(user);
                Console.WriteLine(chat.Users.Count());
                user.Groups.Remove(chat);
                Console.WriteLine(user.Groups.Count());
                await db.SaveChangesAsync();

                var jObject = new JObject();
                jObject["chatId"] = chatId;
                jObject["User"] = JSONConvertor.userToJObject(user);

                await Clients.Group(chatId).SendAsync("memberLeftTheChat", jObject.ToString());
            }   
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
            try
            {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Name == "Tom");
                var user1 = await db.Users.FirstOrDefaultAsync(u => u.Name == "Bob");
                var user2 = await db.Users.FirstOrDefaultAsync(u => u.Name == "Samuel");
                var dialog = new Dialog { User1 = user, User2 = user1 };
                await db.Dialogs.AddAsync(dialog);

                var message = new Message { Content = "sdgoikjsdfkgjd", Sender = user1 };
                dialog.Messages.Add(message);

                var gr = await db.Groups.FirstOrDefaultAsync(g => g.Title == "uihui1");
                gr.Users.Add(user);
                gr.Users.Add(user2);
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Allright");
            }
        }
    }

}
