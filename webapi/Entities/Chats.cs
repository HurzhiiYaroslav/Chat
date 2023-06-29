namespace webapi.Entities
{
    public class Chat
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public List<Message> Messages { get; set; } = new();

    }
    public class Dialog : Chat
    {
        public User User1 { get; set; }
        public User User2 { get; set; }

        public bool Contains(User u)
        {
            return User1.Id==u.Id || User2.Id==u.Id;
        }
    }

    public class Group : Chat
    {
        public string Title { get; set; } = "";
        public List<User> Users { get; set; } = new();
    }

}
