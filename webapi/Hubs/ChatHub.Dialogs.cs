using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using webapi.Utilities;

namespace webapi.Hubs
{
    public partial class ChatHub
    {
        public async Task CreateDialog(string companionId)
        {
            var user = await GetCurrentUserAsync();
            var companion = await db.Clients.FirstOrDefaultAsync(u => u.Id.ToString() == companionId.ToUpper());

            if (companion == null)
            {
                Console.WriteLine($"Companion user with ID '{companionId}' not found in the database.");
                return;
            }

            if (user == companion)
            {
                await Clients.Client(Context.ConnectionId).SendAsync("setError", "Something went wrong");
                return;
            }

            var dialogIfExist = await db.Dialogs.Include(m=>m.Messages).FirstOrDefaultAsync(d => (d.User1 == user && d.User2 == companion) || (d.User1 == companion && d.User2 == user));

            if (dialogIfExist !=null && !dialogIfExist.Messages.All(m=>m.IsDeleted))
            {
                await Clients.Client(Context.ConnectionId).SendAsync("setError", "Dialog already exists");
                return;
            }

            try
            {
                var dialog = await _dialogService.CreateOrGetDialogAsync(user, companion);
                await Groups.AddToGroupAsync(Context.ConnectionId, dialog.Id.ToString());

                string CompanionConnection = connectedUsers.FirstOrDefault(x => x.Value == companionId).Key;
                if (CompanionConnection != null && Context.ConnectionId!= CompanionConnection)
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

    }
}
