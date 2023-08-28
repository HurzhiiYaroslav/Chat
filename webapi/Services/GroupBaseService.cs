
using Microsoft.AspNetCore.SignalR;
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

        protected async Task<string> SaveImageAsync(IFormFile image)
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

    }
}
