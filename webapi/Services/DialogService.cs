using Microsoft.EntityFrameworkCore;
using webapi.Entities;

namespace webapi.Services
{
    public class DialogService
    {
        private readonly ApplicationContext _dbContext;

        public DialogService(ApplicationContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Dialog> CreateOrGetDialogAsync(User user1, User user2)
        {
            var existingDialog = await _dbContext.Dialogs.FirstOrDefaultAsync(d =>
               (d.User1.Id == user1.Id && d.User2.Id == user2.Id) ||
               (d.User1.Id == user2.Id && d.User2.Id == user1.Id));

            if (existingDialog != null)
            {
                return existingDialog;
            }

            var newDialog = new Dialog { User1 = user1, User2 = user2 };
            _dbContext.Dialogs.Add(newDialog);
            await _dbContext.SaveChangesAsync();

            return newDialog;
        }
    }
}
