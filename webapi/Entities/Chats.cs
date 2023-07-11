using Newtonsoft.Json.Linq;

namespace webapi.Entities
{
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
            return User1.Id==u.Id || User2.Id==u.Id;
        }
        public JObject CompaionInfo(User u)
        {
            var c = u==User1 ? User2 : User1;
            var jObject = new JObject();
            jObject["Id"] = c.Id;
            jObject["Name"] = c.Name;
            jObject["Photo"] = c.Photo;
            return jObject;
        }
    }

    public class Group : Chat
    {
        public string Title { get; set; } = "";
        public List<User> Users { get; set; } = new List<User>();
    }
}
