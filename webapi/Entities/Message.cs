namespace webapi.Entities
{
    public class Message
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Content { get; set; } = "";
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public bool IsSeen { get; set; } = false;
        public ICollection<FileEntity> Files { get; set; } = new List<FileEntity>();
        public required User Sender { get; set; }
    }

    public class FileEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Type { get; set; }
        public string Path { get; set; }
    }
}
