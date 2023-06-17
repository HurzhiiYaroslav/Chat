using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Utils;
using webapi.Entities;

namespace webapi.Controllers
{
    [ApiController]
    public class Controllers : ControllerBase
    {
        private readonly ApplicationContext _db;

        public Controllers(ApplicationContext db)
        {
            _db = db;
        }

        [HttpPost("/login")]
        public async Task<IActionResult> Login(AuthData authData)
        {
            var user = await _db.Users.FirstOrDefaultAsync(p => p.Login == authData.Login && p.Password == authData.Password);
            if (user is null)
                return Unauthorized();

            var response = new
            {
                access_token = JWTCreator.CreateToken(user),
                username = user.Id
            };

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterData registerData)
        {
            if (await _db.Users.AnyAsync(p => p.Login == registerData.Login))
                return Conflict();

            var user = new User
            {
                Name = registerData.Username,
                Login = registerData.Login,
                Password = registerData.Password,
                Photo = registerData.PhotoPath
            };

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            var response = new
            {
                access_token = JWTCreator.CreateToken(user),
                username = user.Id
            };

            return Ok(response);
        }

        [HttpPost("setPhoto")]
        public async Task<IActionResult> SetPhoto([FromForm] IFormFile image)
        {
            if (image != null && image.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine("wwwroot/Images", fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                var response = new
                {
                    photoName = fileName
                };

                return Ok(response);
            }

            return Conflict();
        }

        [HttpGet("checkAuth")]
        [Authorize]
        public IActionResult CheckAuth()
        {
            return Ok();
        }
        
    }
    
}
public record class RegisterData(string Username, string Login, string Password, string PhotoPath);
public record class AuthData(string Login, string Password);