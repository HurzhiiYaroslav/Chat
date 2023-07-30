using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Hosting.Internal;
using webapi.Entities;
using webapi.Hubs;
using webapi.Utils;

namespace webapi.Controllers
{
    [ApiController]
    [EnableCors("CORS")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationContext db;
        private readonly IHubContext<ChatHub> hubContext;
        private readonly IWebHostEnvironment _hostEnvironment;

        public ChatController(ApplicationContext db, IHubContext<ChatHub> hubContext, IWebHostEnvironment hostEnvironment)
        {
            this.db = db;
            this.hubContext = hubContext;
            _hostEnvironment = hostEnvironment;
        }

        [HttpPost("/SendMessage")]
        public async Task<IActionResult> SendMessage()
        {
            var contextForm = Request.Form;
            var mes = new Message
            {
                Content = contextForm["Message"],
                Sender = db.Users.First(d => d.Id.ToString() == contextForm["Sender"].ToString().ToUpper())
            };
            if (Request.Form.Files != null && Request.Form.Files.Count > 0)
            {
                foreach (var f in Request.Form.Files)
                {


                    var file = new Entities.File { Name = f.FileName, Type = f.ContentType };
                    var storeName = file.Id.ToString() + Path.GetExtension(f.FileName);
                    file.Path = storeName;
                    mes.Files.Add(file);
                    Directory.CreateDirectory("wwwroot/Media");
                    var filePath = Path.Combine("wwwroot/Media", storeName);
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await f.CopyToAsync(stream);
                }
            }
            var chat = await db.GetChatById(contextForm["Chat"]);
            await db.Messages.AddAsync(mes);
            Console.WriteLine(chat.Id);
            chat.Messages.Add(mes);
            await db.SaveChangesAsync();
            await hubContext.Clients.Groups(contextForm["Chat"]).SendAsync("ReciveMessage",JSONConvertor.MessageTojObject(mes).ToString(), contextForm["Chat"]);
            return Ok();
        }

        [HttpGet("/Download")]
        public async Task<IActionResult> Download(string filePath, string fileType, string fileName)
        {
            var path = Path.Combine(_hostEnvironment.WebRootPath, "Media", $"{filePath}");
            byte[] filedata = System.IO.File.ReadAllBytes(path);
            return File(filedata, fileType, fileName);
        }

        [HttpGet("/GetVideo")]
        public IActionResult GetVideo(string filePath)
        {
            var path = Path.Combine(_hostEnvironment.WebRootPath, "Media", filePath);
            string contentType;
            if (Path.GetExtension(filePath).Equals(".mp4", StringComparison.OrdinalIgnoreCase))
            {
                contentType = "video/mp4";
            }
            else if (Path.GetExtension(filePath).Equals(".webm", StringComparison.OrdinalIgnoreCase))
            {
                contentType = "video/webm";
            }
            else
            {
                contentType = "application/octet-stream";
            }
            if (!System.IO.File.Exists(path))
            {
                return NotFound();
            }
            byte[] fileStream = System.IO.File.ReadAllBytes(path);
            return File(fileStream, contentType, enableRangeProcessing: true);
        }
    }

    
}
