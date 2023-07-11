namespace webapi.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = "";
        public string Login { get; set; } = "";
        public string Password { get; set; } = "";
        public string Photo { get; set; } = "default.jpg";
        public List<Group> Groups { get; set; } = new();
        public List<Dialog> Dialogs { get; set; } = new();

    }

    
}
