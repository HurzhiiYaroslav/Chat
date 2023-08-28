namespace webapi.DataTransferObjects
{
    public class CreateChatDto
    {
        public string? AccessToken { get; set; }
        public string? Type { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; } 
        public required string UserConnection { get; set; }
        public IFormFile? LogoImage { get; set; } 
    }
}
