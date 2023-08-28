using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Threading.Channels;
using webapi.DataTransferObjects;
using webapi.Entities;
using webapi.Hubs;

namespace webapi.Services
{
    public class GroupService : GroupBaseService
    { 
        public GroupService(ApplicationContext dbContext, IHubContext<ChatHub> hubContext) : base(dbContext,hubContext)
        {
        }

        public async Task<Group> Create(CreateChatDto chatDto, User user)
        {
            var chat = new Group
            {
                Creator = user,
                Title = string.IsNullOrWhiteSpace(chatDto.Title) ? "New group" : chatDto.Title,
                Description = string.IsNullOrWhiteSpace(chatDto.Description) ? null : chatDto.Description,
                Logo = await SaveImageAsync(chatDto.LogoImage)
            };

            await _dbContext.Groups.AddAsync(chat);
            chat.Enrollments.Add(new Enrollment { User = user, Role = Role.Admin });
            await _dbContext.SaveChangesAsync();

            return chat;
        }

        public async Task<Group> Leave(Group group, User user)
        {
            if (!group.Users.Contains(user))
                return null;

            group.Users.Remove(user);

            if (group.Users.Count == 0)
            {
                _dbContext.Groups.Remove(group);
                await _dbContext.SaveChangesAsync();
                return null;
            }
            else if (group.Creator == user)
                group.Creator = group.Users[0];

            await _dbContext.SaveChangesAsync();
            return group;
        }
    }
}
