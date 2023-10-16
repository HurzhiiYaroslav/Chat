using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Entities;
using webapi.Shared;
using webapi.Utilities;
using webapi.DataTransferObjects;

namespace webapi.Controllers
{
    [ApiController]
    [EnableCors("CORS")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationContext _db;
        private readonly ILogger<ChatController> _logger;
        public AuthController(ApplicationContext db, ILogger<ChatController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("/login")]
        public async Task<IActionResult> Login([FromBody] AuthRequestDto authRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse { Success = false, Message = "Invalid input data." });
                }

                var user = await _db.Clients.FirstOrDefaultAsync(p => p.Login == authRequest.Login);
                if (user is null || !PasswordHasher.VerifyPassword(authRequest.Password, user.Password))
                {
                    return Unauthorized(new ApiResponse { Success = false, Message = "Invalid login credentials." });
                }

                var response = new AuthResponseDto
                {
                    AccessToken = JWTCreator.CreateToken(user),
                    Username = user.Id.ToString() 
                };

                return Ok(new ApiResponse { Success = true, Data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login.");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse { Success = false, Message = "An error occurred while processing the login request." });
            }
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterRequestDto regRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse { Success = false, Message = "Invalid input data." });
                }

                if (await _db.Clients.AnyAsync(p => p.Login == regRequest.Login))
                {
                    return Conflict(new ApiResponse { Success = false, Message = "User with this login already exists." });
                }

                string salt = PasswordHasher.GenerateSalt();

                var user = new User
                {
                    Name = regRequest.Username,
                    Login = regRequest.Login,
                    PasswordSalt = salt,
                    Password = PasswordHasher.HashPassword(regRequest.Password, salt)
                    
                };

                if (regRequest.Image != null && regRequest.Image.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(regRequest.Image.FileName);
                    Directory.CreateDirectory("wwwroot/Avatars");
                    var filePath = Path.Combine("wwwroot/Avatars", fileName);

                    using var stream = new FileStream(filePath, FileMode.Create);
                    await regRequest.Image.CopyToAsync(stream);

                    user.Photo = fileName;
                }

                await _db.Clients.AddAsync(user);
                await _db.SaveChangesAsync();

                var response = new AuthResponseDto
                {
                    AccessToken = JWTCreator.CreateToken(user),
                    Username = user.Id.ToString(),
                };

                return Ok(new ApiResponse { Success = true, Data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration.");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse { Success = false, Message = "An error occurred while processing the registration request." });
            }
        }


        [Authorize]
        [HttpGet("checkAuth")]
        public IActionResult CheckAuth()
        {
            return Ok();
        }
    }

}