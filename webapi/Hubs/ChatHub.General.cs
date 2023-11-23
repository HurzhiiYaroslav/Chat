using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using webapi.Entities;
using webapi.Utilities;

namespace webapi.Hubs
{
    public partial class ChatHub
    {
        public async Task<string> SearchChats(string userInput)
        {
            var username = connectedUsers[Context.ConnectionId];
            var user = await db.Clients.Include(u => u.Dialogs).Include(u => u.Channels).FirstOrDefaultAsync(u => u.Id.ToString().ToUpper() == username.ToString().ToUpper());
            return JSONConvertor.ConvertUserSearchToJson(user, userInput, db);
        }

        public async Task MarkAsSeen(string chatId, string mesId)
        {
            if (chatId == null || mesId == null) return;
            var user = await GetCurrentUserAsync();
            var mes = await db.Messages.Include(m => m.Sender).FirstOrDefaultAsync(m => m.Id.ToString().ToLower() == mesId);
            var chat = await db.GetChatById(chatId);
            if (mes == null || mes.Sender == user || mes.IsSeen || !chat.Messages.Contains(mes)) return;

            mes.IsSeen = true;
            await db.SaveChangesAsync();
            await Clients.Group(chatId).SendAsync("MessageHasSeen", JSONConvertor.MessageToJsonObject(mes).ToString(), chatId);
        }

        public async Task DeleteMessage(string chatId, string mesId)
        {
            if (chatId == null || mesId == null) return;
            var user = await GetCurrentUserAsync();
            var mes = await db.Messages.Include(m => m.Sender).FirstOrDefaultAsync(m => m.Id.ToString().ToLower() == mesId);
            var chat = await db.GetChatById(chatId);
            Group group = (Group)chat;
            var userEnrollment = group.GetEnrollmentByUser(user);
            if (mes != null && (mes.Sender == user || userEnrollment.Role > group.GetEnrollmentByUser(mes.Sender).Role) && chat.Messages.Contains(mes))
            {
                mes.IsDeleted = true;
                await db.SaveChangesAsync();
                await Clients.Group(chatId).SendAsync("MessageDeleted", mesId, chatId);
            }
        }
        public async Task PinMessage(string chatId, string mesId)
        {
            if (string.IsNullOrEmpty(chatId) || string.IsNullOrEmpty(mesId)) return;
            var user = await GetCurrentUserAsync();
            var mes = await db.Messages.Include(m => m.Sender).FirstOrDefaultAsync(m => m.Id.ToString().ToLower() == mesId);
            if (mes==null||mes.IsPined) return;
            var chat = await db.GetChatById(chatId);
            if (chat is Channel channel)
            {
                var userEnrollment = channel.GetEnrollmentByUser(user);
                if (userEnrollment?.Role == Role.Reader) return;
            }
            mes.IsPined = true;
            await db.SaveChangesAsync();
            await Clients.Group(chatId).SendAsync("MessagePinned", mesId, chatId, true);
        }

        public async Task UnpinMessage(string chatId, string mesId)
        {
            if (string.IsNullOrEmpty(chatId) || string.IsNullOrEmpty(mesId)) return;
            var user = await GetCurrentUserAsync();
            var mes = await db.Messages.Include(m => m.Sender).FirstOrDefaultAsync(m => m.Id.ToString().ToLower() == mesId);
            if (mes == null || !mes.IsPined) return;
            var chat = await db.GetChatById(chatId);
            if (chat is Channel channel)
            {
                var userEnrollment = channel.GetEnrollmentByUser(user);
                if (userEnrollment?.Role == Role.Reader) return;
            }
            mes.IsPined = false;
            await db.SaveChangesAsync();
            await Clients.Group(chatId).SendAsync("MessageUnpinned", mesId, chatId, false);
        }
    }
}
