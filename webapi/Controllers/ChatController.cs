using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Hosting.Internal;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks.Dataflow;
using webapi.Entities;
using webapi.Hubs;
using webapi.Services;
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


        [HttpPost("/EditProfile")]
        public async Task<IActionResult> EditProfile()
        {
            var contextForm = Request.Form;
            if (contextForm == null)
            {
                return BadRequest();
            }
            var token = contextForm["AccessToken"];
            string login;
            JWTCreator.DecodeToken(token, out login);
            var user = await db.Users.FirstOrDefaultAsync(u=>u.Login==login);
            if (string.IsNullOrEmpty(login))
            {
                return Unauthorized();
            }

            string NewName = contextForm["Name"];
            if (!string.IsNullOrEmpty(NewName))
            {
                user.Name= NewName;
            }
            if (Request.Form.Files.Count > 0)
            {
                var image = Request.Form.Files[0];
                if (image != null && image.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                    Directory.CreateDirectory("wwwroot/Avatars");
                    var filePath = Path.Combine("wwwroot/Avatars", fileName);
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await image.CopyToAsync(stream);
                    user.Photo = fileName;
                }
            }
            var OldPassword = contextForm["OldPassword"];
            if (PasswordHasher.VerifyPassword(OldPassword,user.Password))
            {
                var NewPassword = contextForm["NewPassword"];
                user.Password=PasswordHasher.HashPassword(NewPassword);
            }
            await db.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("/CreateChat")]
        public async Task<IActionResult> CreateChat()
        {
            Console.WriteLine("_____________________________________________________________________________");
            var contextForm = Request.Form;
            if (contextForm == null)
            {
                return BadRequest();
            }
            var token = contextForm["AccessToken"];
            string login;
            JWTCreator.DecodeToken(token, out login);
            var user = await db.Users.FirstOrDefaultAsync(u => u.Login == login);
            if (string.IsNullOrEmpty(login))
            {
                return Unauthorized();
            }
            Group chat;
            if (contextForm["Type"] == "Group")
            {
                chat = new Group { Creator = user };
                await db.Groups.AddAsync(chat);
            }
            else
            {
                return BadRequest();
            }
            string Title = contextForm["Title"];
            if (!string.IsNullOrEmpty(Title))
            {
                chat.Title = Title;
            }

            if (Request.Form.Files.Count > 0)
            {
                var image = Request.Form.Files[0];
                if (image != null && image.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                    Directory.CreateDirectory("wwwroot/Media");
                    var filePath = Path.Combine("wwwroot/Media", fileName);
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await image.CopyToAsync(stream);
                    chat.Logo = fileName;
                }
            }
            var Description = contextForm["Description"];
            if (!string.IsNullOrEmpty(Title))
            {
                chat.Description = Description;
            }
            await db.SaveChangesAsync();
            var jObject = new JObject
            {
                ["chatId"] = chat.Id,
                ["userId"] = user.Id
            };
            string v = jObject.ToString();
            return Ok(v);
        }
    }

    
}
