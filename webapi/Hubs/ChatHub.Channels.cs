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

        private async Task<(User user, Channel channel, User publisher)> GetCurUserChannelAndPublisher(string channelId, string publisherId)
        {
            var user = await GetCurrentUserAsync();
            var channel = await db.Channels.Include(c => c.Enrollments).FirstOrDefaultAsync(c => c.Id.ToString() == channelId.ToUpper());
            var publisher = await db.Users.Include(u => u.Groups).FirstOrDefaultAsync(u => u.Id.ToString() == publisherId.ToUpper());

            return (user, channel, publisher);
        }
        private async Task UpdateEnrollmentRoleAndNotifyClients(Channel channel, User publisher, Role newRole, string channelId)
        {
            var enrollment = channel.GetEnrollmentByUser(publisher);
            if (enrollment != null && enrollment.Role != newRole)
            {
                enrollment.Role = newRole;
                await db.SaveChangesAsync();
                await Clients.Group(channelId).SendAsync("updateEnrollment", JsonConvert.SerializeObject(JSONConvertor.EnrollmentToJsonObject(enrollment)), channelId);
            }
        }

        public async Task AddPublisher(string channelId, string publisherId)
        {
            var (user, channel, publisher) = await GetCurUserChannelAndPublisher(channelId, publisherId);
            if (user != null && channel != null && channel.Creator == user)
            {
                await UpdateEnrollmentRoleAndNotifyClients(channel, publisher, Role.Publisher, channelId);
            }
        }

        public async Task AddAdmin(string channelId, string publisherId)
        {
            var (user, channel, publisher) = await GetCurUserChannelAndPublisher(channelId, publisherId);
            if (user != null && channel != null && channel.Creator == user)
            {
                await UpdateEnrollmentRoleAndNotifyClients(channel, publisher, Role.Admin, channelId);
            }
        }

        public async Task MakeReader(string channelId, string publisherId)
        {
            var (user, channel, publisher) = await GetCurUserChannelAndPublisher(channelId, publisherId);
            if (user != null && channel != null && channel.Creator == user && channel.Users.Contains(publisher))
            {
                await UpdateEnrollmentRoleAndNotifyClients(channel, publisher, Role.Reader, channelId);
            }
        }
    }
}
