using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using webapi.Utilities;
using webapi.Entities;
using System;

namespace webapi.Hubs
{
    public partial class ChatHub
    {
        public async Task JoinChannel(string channelId)
        {
            var user = await GetCurrentUserAsync();
            var chat = await db.GetChatById(channelId);
            if (chat != null && user != null && chat is Channel channel && channel.IsPublic)
            {
                channel.Users.Add(user);
                await db.SaveChangesAsync();
                var jObject = new JObject
                {
                    ["chatId"] = channelId,
                    ["User"] = JSONConvertor.EnrollmentToJsonObject(channel.GetEnrollmentByUser(user))
                };
                await Groups.AddToGroupAsync(Context.ConnectionId, channelId);
                await Clients.Group(channelId).SendAsync("newMember", JsonConvert.SerializeObject(jObject));
                await Clients.Client(Context.ConnectionId).SendAsync("newChat", JsonConvert.SerializeObject(JSONConvertor.ChannelToJsonObject(channel)));
                //await Notify(channelId, user.Name + " joined");
            }
        }

        public async Task ChangePublicity(string channelId)
        {
            var user = await GetCurrentUserAsync();
            var chat = await db.Channels.FirstOrDefaultAsync(c => c.Id.ToString() == channelId.ToUpper());
            if (chat != null && user != null && chat is Channel channel)
            {
                channel.IsPublic = !channel.IsPublic;
                string currentPublicity = (channel.IsPublic ? "Public" : "Non-Public");
                db.Update(channel);
                var newLog = new ChatLog
                {
                    Action="changed publicity to " + currentPublicity,
                    User = user,
                };
                db.Add(newLog);
                chat.Logs.Add(newLog);
                await db.SaveChangesAsync();
                await Clients.Group(channelId).SendAsync("publicityChanged", channelId);
                await Notify(channelId, "Channel is " + currentPublicity + " now");
            }

        }

        private async Task<(User user, Group group, User special)> GetCurUserGroupAndSpecial(string groupId, string specialId)
        {
            var user = await GetCurrentUserAsync();
            var group = await db.Groups.Include(c => c.Enrollments).FirstOrDefaultAsync(c => c.Id.ToString() == groupId.ToUpper());
            var special = await db.Clients.Include(u => u.Groups).FirstOrDefaultAsync(u => u.Id.ToString() == specialId.ToUpper());

            return (user, group, special);
        }
        
        public async Task UpdateUserRole(string groupId, string specialId, string newRoleValue)
        {
            Enum.TryParse(newRoleValue, true, out Role newRole);

            var (user, group, special) = await GetCurUserGroupAndSpecial(groupId, specialId);

            if (user != null && group != null && group.GetEnrollmentByUser(user).Role == Role.Owner && group.Users.Contains(special))
            {
                var newLog = new ChatLog
                {
                    Action = "changed  " + special.Name + "`s role to " + newRoleValue,
                    User = user,
                };
                db.Add(newLog);
                group.Logs.Add(newLog);
                await UpdateEnrollmentRole(group, special, newRole, groupId);
            }
        }
        private async Task UpdateEnrollmentRole(Group group, User publisher, Role newRole, string channelId)
        {
            var enrollment = group.GetEnrollmentByUser(publisher);
            if (enrollment != null && enrollment.Role != newRole)
            {
                enrollment.Role = newRole;
                
                await db.SaveChangesAsync();
                await Clients.Group(channelId).SendAsync("updateEnrollment", JsonConvert.SerializeObject(JSONConvertor.EnrollmentToJsonObject(enrollment)), channelId);
            }
        }

    }
}
