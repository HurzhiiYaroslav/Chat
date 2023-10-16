using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations.Schema;

namespace webapi.Entities
{
    [Table("Chats")]
    public class Chat
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public List<Message> Messages { get; set; } = new List<Message>();

    }
    public class Dialog : Chat
    {
        public User User1 { get; set; }
        public User User2 { get; set; }


        public bool Contains(User u)
        {
            return User1.Id == u.Id || User2.Id == u.Id;
        }
        public JObject CompaionInfo(User u)
        {
            var c = u == User1 ? User2 : User1;
            var jObject = new JObject();
            jObject["Id"] = c.Id;
            jObject["Name"] = c.Name;
            jObject["Photo"] = c.Photo;
            return jObject;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || obj is not Dialog)
            {
                return false;
            }

            Dialog otherDialog = (Dialog)obj;
            return (User1.Id == otherDialog.User1.Id && User2.Id == otherDialog.User2.Id)
                || (User1.Id == otherDialog.User2.Id && User2.Id == otherDialog.User1.Id);
        }
        public override int GetHashCode()
        {
            int hash1 = User1.Id.GetHashCode();
            int hash2 = User2.Id.GetHashCode();
            return hash1 ^ hash2;
        }
    }

    public class Group : Chat
    {

        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Logo { get; set; } = "";
        public List<User> Users { get; set; } = new();
        public List<Enrollment> Enrollments { get; set; } = new();

        public Enrollment? GetEnrollmentByUser(User user) => Enrollments.FirstOrDefault(e => e.User == user);
        public List<Enrollment>? GetEnrollmentsByRole(Role role) => Enrollments.Where(e => e.Role == role).ToList();

        public static explicit operator Group(Task<Chat> v)
        {
            throw new NotImplementedException();
        }
    }


    public class Channel : Group
    {
        public bool IsPublic { get; set; } = false;
    }
}
