using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using webapi.Entities;
using webapi.Hubs;
using webapi.Utils;

namespace webapi.Controllers
{
    [ApiController]
    [EnableCors("CORS")]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationContext db;
        private readonly IHubContext<ChatHub> hubContext;
        public ChatController(ApplicationContext db, IHubContext<ChatHub> hubContext)
        {
            this.db = db;
            this.hubContext = hubContext;
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

            foreach (var f in Request.Form.Files)
            {
                if (f != null && f.Length > 0)
                {
                    
                    var file = new Entities.File { Name = f.FileName, Type = f.ContentType};
                    var storeName = file.Id.ToString() + Path.GetExtension(f.FileName);
                    file.Path = storeName;
                    mes.Files.Add(file);
                    Directory.CreateDirectory("wwwroot/Media");
                    var filePath = Path.Combine("wwwroot/Media", storeName);
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await f.CopyToAsync(stream);
                }
            }
            var chat = db.GetChatById(contextForm["Chat"]);
            chat.Messages.Add(mes);
            await db.Messages.AddAsync(mes);
            await db.SaveChangesAsync();
            await hubContext.Clients.Groups(contextForm["Chat"]).SendAsync("ReciveMessage",JSONConvertor.MessageTojObject(mes).ToString(), contextForm["Chat"]);
            return Ok();
        }

    }
}
