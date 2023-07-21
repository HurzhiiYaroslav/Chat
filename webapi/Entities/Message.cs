
namespace webapi.Entities
{
    public class Message
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Content { get; set; } = "";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public ICollection<File> Files { get; set; } = new List<File>();
        public User Sender { get; set; }
    }

    public class File
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Type { get; set; }
        public string Path { get; set; }
    }
}
