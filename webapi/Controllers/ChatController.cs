using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks.Dataflow;
using webapi.DataTransferObjects;
using webapi.Entities;
using webapi.Hubs;
using webapi.Shared;
using webapi.Services;
using webapi.Utils;
using Microsoft.IdentityModel.Tokens;
using System;
using Newtonsoft.Json;

namespace webapi.Controllers
{
    [ApiController]
    [EnableCors("CORS")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationContext _db;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<ChatController> _logger;
        private readonly UserService _userService;
        private readonly GroupService _groupService;
        private readonly ChannelService _channelService;

        public ChatController(ApplicationContext db, IHubContext<ChatHub> hubContext, ILogger<ChatController> logger, UserService userService, GroupService groupService,ChannelService channelService)
        {
            _db = db;
            _hubContext = hubContext;
            _logger = logger;
            _userService = userService;
            _groupService = groupService;
            _channelService = channelService;
        }

        [HttpPost("/SendMessage")]
        public async Task<IActionResult> SendMessage([FromForm] SendMessageDto messageDto)
        {
            try
            {
                if (messageDto == null || string.IsNullOrWhiteSpace(messageDto.AccessToken) || string.IsNullOrWhiteSpace(messageDto.ChatId))
                {
                    return BadRequest(new ApiResponse { Success = false, Message = "Invalid message data." });
                }

                var user = await _userService.GetUserFromToken(messageDto.AccessToken);
                if (user == null)
                {
                    return Unauthorized(new ApiResponse { Success = false, Message = "Invalid access token." });
                }

                var chat = await _db.GetChatById(messageDto.ChatId);
                if (chat == null)
                {
                    return NotFound(new ApiResponse { Success = false, Message = "Chat not found." });
                }

                var message = new Message
                {
                    Content = messageDto.Message,
                    Sender = user
                };
                _db.Messages.Add(message);

                chat.Messages.Add(message);

                if (messageDto.Attachments != null && messageDto.Attachments.Count > 0)
                {
                    foreach (var attachment in messageDto.Attachments)
                    {
                        var file = new FileEntity { Name = attachment.FileName, Type = attachment.ContentType };
                        var storeName = Guid.NewGuid().ToString() + Path.GetExtension(attachment.FileName);
                        file.Path = storeName;

                        Directory.CreateDirectory("wwwroot/Media");
                        var filePath = Path.Combine("wwwroot/Media", storeName);

                        using var stream = new FileStream(filePath, FileMode.Create);
                        await attachment.CopyToAsync(stream);

                        message.Files.Add(file);
                    }
                }

                await _db.SaveChangesAsync();

                await _hubContext.Clients.Group(chat.Id.ToString()).SendAsync("ReceiveMessage", JSONConvertor.MessageToJsonObject(message).ToString(), messageDto.ChatId);

                return Ok(new ApiResponse { Success = true, Message = "Message sent successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message.");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse { Success = false, Message = "An error occurred while sending the message." });
            }
        }

        [HttpPost("/EditProfile")]
        public async Task<IActionResult> EditProfile([FromForm] EditProfileDto profileDto)
        {
            try
            {
                if (profileDto == null || string.IsNullOrWhiteSpace(profileDto.AccessToken))
                {
                    return BadRequest(new ApiResponse { Success = false, Message = "Invalid profile data." });
                }

                var user = await _userService.GetUserFromToken(profileDto.AccessToken);
                if (user == null)
                {
                    return Unauthorized(new ApiResponse { Success = false, Message = "Invalid access token." });
                }

                if (!string.IsNullOrEmpty(profileDto.NewName))
                {
                    user.Name = profileDto.NewName;
                }

                if (profileDto.Avatar != null)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(profileDto.Avatar.FileName);
                    Directory.CreateDirectory("wwwroot/Avatars");
                    var filePath = Path.Combine("wwwroot/Avatars", fileName);

                    using var stream = new FileStream(filePath, FileMode.Create);
                    await profileDto.Avatar.CopyToAsync(stream);

                    user.Photo = fileName;
                }

                if (Validator.Password(profileDto.NewPassword) && Validator.Password(profileDto.OldPassword))
                {
                    if (PasswordHasher.VerifyPassword(profileDto.OldPassword, user.Password))
                    {
                        user.Password = PasswordHasher.HashPassword(profileDto.NewPassword);
                    }
                    else
                    {
                        return BadRequest(new ApiResponse { Success = false, Message = "Incorrect old password." });
                    }
                }

                await _db.SaveChangesAsync();

                return Ok(new ApiResponse { Success = true, Message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile.");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse { Success = false, Message = "An error occurred while updating the profile." });
            }
        }

        [HttpPost("CreateChat")]
        public async Task<IActionResult> CreateChat([FromForm] CreateChatDto chatDto)
        {
            try
            {
                if (chatDto == null || string.IsNullOrWhiteSpace(chatDto.AccessToken) || string.IsNullOrWhiteSpace(chatDto.Type))
                {
                    return BadRequest(new ApiResponse { Success = false, Message = "Invalid chat data." });
                }

                var user = await _userService.GetUserFromToken(chatDto.AccessToken);
                if (user == null)
                {
                    return Unauthorized(new ApiResponse { Success = false, Message = "Invalid access token." });
                }

                Chat? chat = null;
                JObject? response = null;
                if (chatDto.Type == "Group")
                {
                    chat = await _groupService.Create(chatDto,user);
                    response = JSONConvertor.GroupToJsonObject((Group)chat);
                }
                else if (chatDto.Type == "Channel")
                {
                    chat = await _channelService.Create(chatDto,user);
                    response = JSONConvertor.ChannelToJsonObject((Channel)chat);
                }

                if (chat == null || response == null)
                {
                    return BadRequest(new ApiResponse { Success = false, Message = "Invalid chat type." });
                }
                else
                {
                    await _hubContext.Groups.AddToGroupAsync(chatDto.UserConnection,chat.Id.ToString());
                    return Ok(new ApiResponse { Success = true, Message = "Chat created successfully.", Data = JsonConvert.SerializeObject(response) });
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating chat.");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse { Success = false, Message = "An error occurred while creating the chat." });
            }
        }
    }


}
