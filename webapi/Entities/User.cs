using Microsoft.EntityFrameworkCore;

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
        public List<Channel> Channels { get; set; } = new();
        public List<Enrollment> Enrollments { get; set; } = new();

    }

    public class Enrollment
    {
        public Guid UserId { get; set; }
        public  User? User { get; set; }
        public Guid GroupId { get; set; }
        public  Group? Group { get; set; }
        public string? LastSeenMes { get; set; } = "";
        public Role Role { get; set; } = Role.Reader;

    }

    public enum Role
    {
        Reader,
        Publisher,
        Moder,
        Owner
    }
}
