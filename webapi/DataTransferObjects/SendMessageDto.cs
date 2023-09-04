namespace webapi.DataTransferObjects
{
    public class SendMessageDTO
    {
        public string? AccessToken { get; set; }
        public string? ChatId { get; set; }
        public string? Message { get; set; } = "";
        public List<IFormFile>? Attachments { get; set; }
    }
}
