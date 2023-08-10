namespace webapi.DataTransferObjects
{
    public class EditProfileDto
    {
        public string? AccessToken { get; set; } = null;
        public string? NewName { get; set; } = null;
        public IFormFile? Avatar { get; set; } = null;
        public string? OldPassword { get; set; } = null;
        public string? NewPassword { get; set; } = null;
    }
}
