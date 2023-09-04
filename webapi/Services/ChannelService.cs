using Microsoft.AspNetCore.SignalR;
using webapi.DataTransferObjects;
using webapi.Entities;
using webapi.Hubs;

namespace webapi.Services
{
    public class ChannelService : GroupBaseService
    {

        public ChannelService(ApplicationContext dbContext, IHubContext<ChatHub> hubContext) : base(dbContext, hubContext)
        {
        }

        public async Task<Group> Create(CreateChatDTO chatDto, User user)
        {
            var channel = new Channel
            {
                Enrollments = new List<Enrollment> { new Enrollment { User = user, Role = Role.Owner } },
                Title = string.IsNullOrWhiteSpace(chatDto.Title) ? "New channel" : chatDto.Title,
                Description = string.IsNullOrWhiteSpace(chatDto.Description) ? null : chatDto.Description,
                Logo = await SaveImageAsync(chatDto.LogoImage)
            };

            await _dbContext.Channels.AddAsync(channel);
            await _dbContext.SaveChangesAsync();

            return channel;
        }

    }
}
