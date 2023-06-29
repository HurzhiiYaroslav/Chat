using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Utils;
using webapi.Entities;
using webapi.Hubs;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;

namespace webapi.Controllers
{
    [ApiController]
    [EnableCors("CORS")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationContext _db;
        public AuthController(ApplicationContext db)
        {
            _db = db;
        }

        [HttpPost("/login")]
        public async Task<IActionResult> Login(AuthData authData)
        {
            var user = await _db.Users.FirstOrDefaultAsync(p => p.Login == authData.Login);
            if (user is null || !PasswordHasher.VerifyPassword(authData.Password, user.Password))
                return Unauthorized();

            var response = new
            {
                access_token = JWTCreator.CreateToken(user),
                username = user.Id
            };
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register()
        {
            var contextForm=Request.Form;
            if (await _db.Users.AnyAsync(p => p.Login == (string)contextForm["Login"]))
                return Conflict();

            var user = new User
            {
                Name = contextForm["Username"],
                Login =contextForm["Login"],
                Password = PasswordHasher.HashPassword(contextForm["Password"])

            };

                var image = Request.Form.Files[0];
                if (image != null && image.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                    Directory.CreateDirectory("wwwroot/Images");
                    var filePath = Path.Combine("wwwroot/Images", fileName);
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await image.CopyToAsync(stream);

                    user.Photo = fileName;
                }
                else
                {
                    return BadRequest("No image attached");
                }
            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            var response = new
            {
                access_token = JWTCreator.CreateToken(user),
                username = user.Id
            };

            return Ok(response);
        }

        public class RegData
        {
            public string Username { get; set; }
            public string Login { get; set; }
            public string Password { get; set; }
            public IFormFile Image { get; set; }
        }

        [Authorize]
        [HttpGet("checkAuth")]
        public IActionResult CheckAuth()
        {
            return Ok();
        }
        
    }
    
}
public record class RegisterData(string Username, string Login, string Password, string PhotoPath);
public record class AuthData(string Login, string Password);