
using Microsoft.AspNetCore.SignalR;
using System.ComponentModel.DataAnnotations;
using webapi.DataTransferObjects;
using webapi.Entities;
using webapi.Hubs;

namespace webapi.Services
{
    public class GroupBaseService
    {
        protected readonly ApplicationContext _dbContext;
        protected readonly IHubContext<ChatHub> _hubContext;
        public GroupBaseService(ApplicationContext dbContext, IHubContext<ChatHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        protected async Task<string> SaveImageAsync(IFormFile? image)
        {
            if (image == null || image.Length <= 0)
                return GenerateRandomColor();

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
            var filePath = Path.Combine("wwwroot/Media", fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(filePath));

            using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            return fileName;
        }

        private static string GenerateRandomColor()
        {
            Random random = new();
            return $"#{random.Next(0x1000000):X6}";
        }

        public async Task<Group?> Leave(Group group, User user)
        {
            if (!group.Users.Contains(user))
                return null;

            var UserEnrollment = group.GetEnrollmentByUser(user);

            if (UserEnrollment.Role == Role.Owner && group.GetEnrollmentsByRole(Role.Owner).Count == 1)
            {
                if (group.GetEnrollmentsByRole(Role.Moder).Count > 0)
                    group.GetEnrollmentsByRole(Role.Moder)[0].Role = Role.Owner;
                else if (group.GetEnrollmentsByRole(Role.Publisher).Count > 0)
                    group.GetEnrollmentsByRole(Role.Publisher)[0].Role = Role.Owner;
                else
                {
                    group.GetEnrollmentsByRole(Role.Reader)[0].Role = Role.Owner;
                }
            }

            group.Users.Remove(user);

            if (group.Users.Count == 0)
            {
                _dbContext.Groups.Remove(group);
                await _dbContext.SaveChangesAsync();
                return null;
            }
            await _dbContext.SaveChangesAsync();
            return group;
        }


        public async Task<Group?> EditGroup(EditGroupDTO editGroupDTO,User user)
        {
            Group group = (Group)await _dbContext.GetChatById(editGroupDTO.GroupId);

            if (group != null)
            {
                if (!string.IsNullOrWhiteSpace(editGroupDTO.Title))
                    group.Title = editGroupDTO.Title;
                if (!string.IsNullOrWhiteSpace(editGroupDTO.Description))
                    group.Description = editGroupDTO.Description;
                if (editGroupDTO.LogoImage is not null)
                {
                    group.Logo = await SaveImageAsync(editGroupDTO.LogoImage);
                }
                await _dbContext.SaveChangesAsync();
                return group;
            }

            return null;
        }
    }
}
