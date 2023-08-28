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

        public async Task<Group> Create(CreateChatDto chatDto, User user)
        {
            var channel = new Channel
            {
                Creator = user,
                Enrollments = new List<Enrollment> { new Enrollment { User = user, Role = Role.Admin }},
                Title = string.IsNullOrWhiteSpace(chatDto.Title) ? "New channel" : chatDto.Title,
                Description = string.IsNullOrWhiteSpace(chatDto.Description) ? null : chatDto.Description,
                Logo = await SaveImageAsync(chatDto.LogoImage)
            };
            
            await _dbContext.Channels.AddAsync(channel);
            await _dbContext.SaveChangesAsync();

            return channel;
        }

        public async Task<Group?> Leave(Channel channel, User user)
        {
            if (!channel.Users.Contains(user))
                return null;

                channel.Users.Remove(user);

            if (channel.Users.Count == 0)
            {
                _dbContext.Channels.Remove(channel);
                await _dbContext.SaveChangesAsync();
                return null;
            }

            //if (channel.Creator == user)
            //{
            //    if (channel.Enrollments.Where(e => e.Role == Role.Admin).ToList().Count > 0)
            //        channel.Creator = channel.Users[0];
            //    else if (channel.Enrollments.Where(e => e.Role == Role.Publisher).ToList().Count > 0)
            //        channel.Creator = channel.Users[0];
            //    else
            //    {
            //        channel.Creator = channel.Users[0];
            //    }
            //}

            await _dbContext.SaveChangesAsync();
            return channel;
        }
    }
}
