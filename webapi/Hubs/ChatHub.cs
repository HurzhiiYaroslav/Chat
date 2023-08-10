using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using webapi.Entities;
using webapi.Services;
using webapi.Utils;

namespace webapi.Hubs
{

    [EnableCors("CORS")]
    [Authorize]
    public class ChatHub : Hub
    {
        private ApplicationContext db;
        private static Dictionary<string, string> connectedUsers = new Dictionary<string, string>();
        private readonly DialogService _dialogService;


        public ChatHub(ApplicationContext db, DialogService dialogService)
        {
            this.db = db;
            _dialogService = dialogService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext().Request.Query["username"];
            connectedUsers[Context.ConnectionId] = userId;
            await Clients.Others.SendAsync("UserConnected", userId);
            await Test();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId.ToString().ToUpper());
            if (user is not null)
            {
                List<Chat> chats = db.GetChatsForUser(user);
                await AddUserToGroups(Context.ConnectionId, chats);
                var u = JSONConvertor.ConvertChatDataToJson(user, db);
                await Clients.Client(Context.ConnectionId).SendAsync("UserData", u);
                var connectedUserList = connectedUsers.Values.ToList();
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

        public async Task<string> SearchChats(string userInput)
        {
            var username = connectedUsers[Context.ConnectionId];
            var user = db.Users.Include(u => u.Dialogs).FirstOrDefault(u => u.Id.ToString() == username.ToString().ToUpper());
            return JSONConvertor.ConvertUserSearchToJson(user, userInput, db).ToString();
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

            if (await db.Dialogs.AnyAsync(d => (d.User1 == user && d.User2 == companion) || (d.User1 == companion && d.User2 == user)))
            {
                await Clients.Client(Context.ConnectionId).SendAsync("setError", "Dailog already exist");
                return;
            }

            try
            {
                var dialog = await _dialogService.CreateOrGetDialogAsync(user, companion);
                await Groups.AddToGroupAsync(Context.ConnectionId, dialog.Id.ToString());

                string CompanionConnection = connectedUsers.FirstOrDefault(x => x.Value == companionId).Key;
                if (CompanionConnection != null)
                {
                    await Groups.AddToGroupAsync(CompanionConnection, dialog.Id.ToString());
                    await Clients.Client(CompanionConnection).SendAsync("newChat", JSONConvertor.DialogToJsonObject(dialog, companion).ToString());
                }
                await Clients.Client(Context.ConnectionId).SendAsync("newChat", JSONConvertor.DialogToJsonObject(dialog, user).ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex}");
            }
        }

        public async Task Invite(string ivitedUserId, string roomId)
        {
            var userId = connectedUsers[Context.ConnectionId];
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId.ToUpper());
            var room = await db.Groups.Include(g => g.Creator).FirstOrDefaultAsync(g => g.Id.ToString() == roomId.ToUpper());
            var invitedUser = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == ivitedUserId.ToUpper());
            if (invitedUser != null && room != null)
            {
                room.Users.Add(invitedUser);
                await db.SaveChangesAsync();
                var jObject = new JObject
                {
                    ["chatId"] = roomId,
                    ["User"] = JSONConvertor.UserToJsonObject(invitedUser)
                };
                await Clients.Group(roomId).SendAsync("newMember", jObject.ToString());
                await Notify(roomId, user.Name + " invited "+invitedUser.Name);
                string InvitedUserConnection = connectedUsers.FirstOrDefault(x => x.Value == ivitedUserId).Key;
                if (InvitedUserConnection != null)
                {
                    await Groups.AddToGroupAsync(InvitedUserConnection, roomId);
                    await Clients.Client(InvitedUserConnection).SendAsync("newChat", JSONConvertor.GroupToJsonObject(room).ToString());
                }
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
            var user = await db.Users.Include(u => u.Groups).FirstOrDefaultAsync(u => u.Id.ToString() == userId.ToUpper());
            var chat = await db.Groups.Include(g => g.Users).FirstOrDefaultAsync(g => g.Id.ToString() == chatId.ToUpper());

            if (user != null && chat != null && chat.Users.Contains(user))
            {
                chat.Users.Remove(user);
                await db.SaveChangesAsync();
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
                var jObject = new JObject
                {
                    ["chatId"] = chatId,
                    ["User"] = JSONConvertor.UserToJsonObject(user)
                };
                if (chat.Users.Count == 0)
                {
                    db.Groups.Remove(chat);
                    await Clients.Caller.SendAsync("setError", "true");
                    return;
                }
                await Clients.Group(chatId).SendAsync("memberLeftTheChat", jObject.ToString());
                await Notify(chatId, user.Name + " left the group");
            }
        }

        public async Task Kick(string chatId, string exileId)
        {
            var userId = connectedUsers[Context.ConnectionId];
            var user = await db.Users.Include(u => u.Groups).SingleOrDefaultAsync(u => u.Id.ToString() == userId.ToUpper());
            var chat = await db.Groups.Include(g => g.Users).SingleOrDefaultAsync(g => g.Id.ToString() == chatId.ToUpper());
            var exile = await db.Users.Include(u => u.Groups).SingleOrDefaultAsync(u => u.Id.ToString() == exileId.ToUpper());

            if (chat != null && chat.Creator == user && exile != null && chat.Users.Contains(exile))
            {
                chat.Users.Remove(exile);
                await db.SaveChangesAsync();
                var jObject = new JObject
                {
                    ["chatId"] = chatId,
                    ["User"] = JSONConvertor.UserToJsonObject(exile)
                };
                await Clients.Group(chatId).SendAsync("memberLeftTheChat", jObject.ToString());
                await Notify(chatId, user.Name + " kicked " + exile.Name);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var username = connectedUsers[Context.ConnectionId];
            connectedUsers.Remove(Context.ConnectionId);
            await Clients.Others.SendAsync("UserDisconnected", username);
            await base.OnDisconnectedAsync(exception);
        }

        private async Task Notify(string chatId, string message)
        {
            var notify = new JObject
            {
                ["chatId"] = chatId,
                ["notification"] = message
            };
            await Clients.Group(chatId).SendAsync("notify", notify.ToString());
        }

        private async Task Test()
        {

            try
            {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Name == "Tom");
                var user1 = await db.Users.FirstOrDefaultAsync(u => u.Name == "Bob");
                var user2 = await db.Users.FirstOrDefaultAsync(u => u.Name == "Samuel");
                if (await db.Dialogs.AnyAsync(d => (d.User1 == user && d.User2 == user1) || (d.User1 == user1 && d.User2 == user)))
                {
                    return;
                }
                var dialog = await _dialogService.CreateOrGetDialogAsync(user, user1);

                var group = new Group { Creator = user };
                await db.Groups.AddAsync(group);
                group.Users.Add(user);
                group.Users.Add(user2);

                var message = new Message { Content = "sdgoikjsdfkgjd", Sender = user1 };
                await db.Messages.AddAsync(message);
                dialog.Messages.Add(message);
                await db.SaveChangesAsync();
            }
            catch
            {
                Console.WriteLine("Allright");
            }
        }
    }

}
