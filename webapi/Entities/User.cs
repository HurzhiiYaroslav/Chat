namespace webapi.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = "";
        public string Login { get; set; } = "";
        public string Password { get; set; } = "";
        public string Photo { get; set; } = "default";
        public List<Chat> Chats { get; set; } = new();
    }
}
