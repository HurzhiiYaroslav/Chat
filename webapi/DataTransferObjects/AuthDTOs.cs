namespace webapi.DataTransferObjects
{
    public class AuthRequestDto
    {
        public required string Login { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterRequestDto
    {
        public required string Username { get; set; }
        public required string Login { get; set; }
        public required string Password { get; set; }
        public IFormFile? Image { get; set; }
    }

    public class AuthResponseDto
    {
        public required string AccessToken { get; set; }
        public required string Username { get; set; }
    }
}
