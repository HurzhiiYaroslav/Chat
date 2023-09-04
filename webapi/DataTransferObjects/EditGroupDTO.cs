namespace webapi.DataTransferObjects
{
    public class EditGroupDTO
    {
        public string AccessToken { get; set; }
        public string GroupId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public IFormFile? LogoImage { get; set; }
    }
}
