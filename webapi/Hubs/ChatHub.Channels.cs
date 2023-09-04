using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using webapi.Utils;
using webapi.Entities;

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
                db.Update(channel);
                await db.SaveChangesAsync();
                await Clients.Group(channelId).SendAsync("publicityChanged", channelId);
                await Notify(channelId, "Channel is " + (channel.IsPublic ? "Public" : "Non-Public") + " now");
            }

        }

        private async Task<(User user, Group group, User special)> GetCurUserGroupAndSpecial(string groupId, string specialId)
        {
            var user = await GetCurrentUserAsync();
            var group = await db.Groups.Include(c => c.Enrollments).FirstOrDefaultAsync(c => c.Id.ToString() == groupId.ToUpper());
            var special = await db.Users.Include(u => u.Groups).FirstOrDefaultAsync(u => u.Id.ToString() == specialId.ToUpper());

            return (user, group, special);
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

        public async Task AddPublisher(string groupId, string specialId)
        {
            var (user, group, publisher) = await GetCurUserGroupAndSpecial(groupId, specialId);
            if (user != null && group != null && group.GetEnrollmentByUser(user).Role == Role.Owner)
            {
                await UpdateEnrollmentRole(group, publisher, Role.Publisher, groupId);
            }
        }

        public async Task MakeReader(string groupId, string punishedId)
        {
            var (user, group, punished) = await GetCurUserGroupAndSpecial(groupId, punishedId);
            if (user != null && group != null && group.GetEnrollmentByUser(user).Role == Role.Owner && group.Users.Contains(punished))
            {
                await UpdateEnrollmentRole(group, punished, Role.Reader, groupId);
            }
        }
    }
}
