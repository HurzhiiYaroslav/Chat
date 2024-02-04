using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using webapi.Utilities;
using webapi.Entities;
using Newtonsoft.Json;
using System;

namespace webapi.Hubs
{
    public partial class ChatHub
    {
        public async Task Invite(string invitedUserId, string roomId)
        {
            
            var user = await GetCurrentUserAsync();
            var invited = await db.Clients.FirstOrDefaultAsync(u => u.Id.ToString() == invitedUserId.ToUpper());
            var room = await db.GetChatById(roomId);
            
            if (invited != null && room != null)
            {
                await AddUserToChat(room, invited);
                await NotifyInvitation(user, invited, (Group)room);
                string InvitedUserConnection = connectedUsers.FirstOrDefault(x => x.Value == invitedUserId).Key;
                if (InvitedUserConnection != null)
                {
                    await Groups.AddToGroupAsync(InvitedUserConnection, roomId);
                    if (room is Channel ch)
                        await Clients.Client(InvitedUserConnection).SendAsync("newChat", JsonConvert.SerializeObject(JSONConvertor.ChannelToJsonObject(ch)));
                    else if (room is Group gr)
                        await Clients.Client(InvitedUserConnection).SendAsync("newChat", JsonConvert.SerializeObject(JSONConvertor.GroupToJsonObject(gr)));
                }
            }
            else
            {
                await Clients.Client(Context.ConnectionId).SendAsync("setError", "Something went wrong");
                return;
            }
        }

        private async Task AddUserToChat(Chat chat, User invited)
        {

            if (chat is Group group) group.Users.Add(invited);
            if (chat is Channel channel) channel.Users.Add(invited);
            User user = await GetCurrentUserAsync();
            var newLog = new ChatLog
            {
                Action = " invited " + invited.Name,
                User = user,
            };
            db.Add(newLog);
            chat.Logs.Add(newLog);
            await db.SaveChangesAsync();
        }

        private async Task NotifyInvitation(User inviter, User invitedUser, Group room)
        {
            var jObject = new JObject
            {
                ["chatId"] = room.Id,
                ["User"] = JSONConvertor.EnrollmentToJsonObject(room.GetEnrollmentByUser(invitedUser))
            };
            if(inviter!=invitedUser)
            await Clients.Group(room.Id.ToString()).SendAsync("newMember", jObject.ToString());
            await Notify(room.Id.ToString(), inviter.Name + " invited " + invitedUser.Name);
        }

        public async Task Leave(string chatId)
        {
            var user = await GetCurrentUserAsync();
            var chat = await db.GetChatById(chatId);

            await HandleMemberLeft(chat, user, Context.ConnectionId);
            var newLog = new ChatLog
            {
                Action = " left the chat",
                User = user,
            };
            db.Add(newLog);
            chat.Logs.Add(newLog);
            if (chat is Channel channel) await _channelService.Leave(channel, user);
            else if (chat is Group group) await _groupService.Leave(group, user);
            
        }

        public async Task Kick(string chatId, string exileId)
        {
            var user = await GetCurrentUserAsync();
            var chat = await db.GetChatById(chatId);
            var exile = await db.Clients.Include(u => u.Groups).FirstOrDefaultAsync(u => u.Id.ToString() == exileId.ToUpper());
            Group group = (Group)chat;
            var userEnrollment = group.GetEnrollmentByUser(user);
            if (group.Users.Contains(exile))
            {
                if (userEnrollment.Role > group.GetEnrollmentByUser(exile).Role)
                {
                    group.Users.Remove(exile);
                    var newLog = new ChatLog
                    {
                        Action = " kicked " + exile.Name,
                        User = user,
                    };
                    db.Add(newLog);
                    chat.Logs.Add(newLog);
                    await db.SaveChangesAsync();
                    await HandleMemberLeft(chat, exile, connectedUsers.FirstOrDefault(x => x.Value == exileId).Key);
                    await Notify(chatId, user.Name + " kicked " + exile.Name);
                }
                else
                {
                    await Clients.Client(Context.ConnectionId).SendAsync("setError", "Not enough rights");
                }
            }
        }

        private async Task HandleMemberLeft(Chat chat, User member, string? connection)
        { 
            var jObject = new JObject
            {
                ["chatId"] = chat.Id,
                ["UserId"] = member.Id,
            };
            await Clients.Group(chat.Id.ToString()).SendAsync("memberLeftTheChat", jObject.ToString());
            if (!string.IsNullOrWhiteSpace(connection)) 
                await Groups.RemoveFromGroupAsync(connection, chat.Id.ToString());
            await Notify(chat.Id.ToString(), member.Name + " left the group");
        }

    }
}
