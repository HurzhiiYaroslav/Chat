namespace webapi.Entities
{
    public class Chat
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = "";
        public List<User> Users { get; set; } = new();
        public List<Message> Messages { get; set; } = new();

    }
}
