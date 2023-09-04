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

        public async Task<Group> Create(CreateChatDTO chatDto, User user)
        {
            var chat = new Group
            {
                Enrollments = new List<Enrollment> { new Enrollment { User = user, Role = Role.Owner } },
                Title = string.IsNullOrWhiteSpace(chatDto.Title) ? "New group" : chatDto.Title,
                Description = string.IsNullOrWhiteSpace(chatDto.Description) ? "" : chatDto.Description,
                Logo = await SaveImageAsync(chatDto.LogoImage)
            };

            await _dbContext.Groups.AddAsync(chat);
            await _dbContext.SaveChangesAsync();

            return chat;
        }
    }
}
