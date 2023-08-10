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
        public string Logo { get; set; }
        public User Creator { get; set; }
        public List<User> Users { get; set; } = new List<User>();
        public Group()
        {
            Title = Id.ToString()[..10].ToLowerInvariant() ?? "defaulttitle";
            Logo = GenerateRandomColor();
        }

        private string GenerateRandomColor()
        {
            Random random = new Random();
            return $"#{random.Next(0x1000000):X6}";
        }
    }
}
