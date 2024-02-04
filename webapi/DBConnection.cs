using Microsoft.EntityFrameworkCore;
using webapi.Entities;
using webapi.Utilities;

namespace webapi
{
    public class ApplicationContext : DbContext
    {
        public DbSet<User> Clients { get; set; } = null!;
        public DbSet<Dialog> Dialogs { get; set; } = null!;
        public DbSet<Group> Groups { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<Channel> Channels { get; set; } = null!;
        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            //Database.EnsureDeleted();
            //await Database.MigrateAsync();
            //Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<Message>()
                .HasKey(m => m.Id);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender);
            modelBuilder.Entity<Message>()
                .HasMany(m => m.Files);

            modelBuilder.Entity<Chat>()
                .HasKey(c => c.Id);
            modelBuilder.Entity<Chat>()
                .HasMany(b => b.Messages);
            modelBuilder.Entity<Chat>()
                .HasMany(b => b.Logs);

            modelBuilder.Entity<ChatLog>()
                .HasOne(ch => ch.Chat)
                .WithMany(c => c.Logs);

            modelBuilder.Entity<Dialog>()
                .HasBaseType<Chat>();
            modelBuilder.Entity<Dialog>()
                .HasOne(d => d.User1)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Dialog>()
                .HasOne(d => d.User2)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Group>()
                .HasBaseType<Chat>();
            modelBuilder.Entity<Group>()
                .HasMany(g => g.Users)
                .WithMany(s => s.Groups)
                .UsingEntity<Enrollment>(
        j => j
            .HasOne(e=>e.User)
            .WithMany(u=>u.Enrollments)
            .HasForeignKey(e=>e.UserId)
            .OnDelete(DeleteBehavior.Cascade),
        j => j
            .HasOne(e => e.Group)
            .WithMany(g=>g.Enrollments)
            .HasForeignKey(e => e.GroupId)
            .OnDelete(DeleteBehavior.Restrict));

            modelBuilder.Entity<Channel>()
                .HasBaseType<Group>();

            base.OnModelCreating(modelBuilder);
        }
        public async Task<Chat> GetChatById(string Id)
        {
            Id = Id.ToUpper();
            var dialog = await Dialogs
                .Include(d=>d.Messages)
                .Include(d=>d.Logs)
                .FirstOrDefaultAsync(d => d.Id.ToString() == Id);
            if (dialog != null)
            {
                return dialog;
            }
            var group = await Groups
                .Include(g=>g.Messages)
                .Include(g => g.Users)
                .Include(g => g.Logs)
                .FirstOrDefaultAsync(g => g.Id.ToString() == Id);
            if (group != null)
            {
                return group;
            }
            var channel = await Channels
                .Include(c => c.Messages)
                .Include(c => c.Users)
                .Include(c => c.Logs)
                .FirstOrDefaultAsync(g => g.Id.ToString() == Id);
            if (group != null)
            {
                return group;
            }
            return null;
        }

        public List<Chat> GetChatsForUser(User user)
        {
            var dialogs = Dialogs
                .Include(d => d.User1)
                .Include(d => d.User2)
                .Include(d => d.Messages)
                .ThenInclude(m => m.Files)
                .Where(d => d.User1 == user || d.User2 == user && !d.Messages.All(m=>m.IsDeleted))
                .Select(d => new
                {
                    Chat = (Chat)d,
                    LastMessageTimestamp = d.Messages.OrderByDescending(m => m.Timestamp)
                                                                    .Select(m => m.Timestamp)
                                                                    .FirstOrDefault()
                })
                                .ToList();
            var groupChats = Groups
                .Include(g => g.Users)
                .Include(g => g.Messages)
                .ThenInclude(m => m.Files)
                .Where(g => g.Users.Any(u => u == user) && g.GetType() != typeof(Channel) && !g.Messages.All(m => m.IsDeleted))
                .Select(g => new
                {
                    Chat = (Chat)g,
                    LastMessageTimestamp = g.Messages.OrderByDescending(m => m.Timestamp)
                                                     .Select(m => m.Timestamp)
                                                     .FirstOrDefault()
                })
                .ToList();
            var channels = Channels
                .Include(g => g.Users)
                .Include(g => g.Messages)
                .ThenInclude(m => m.Files)
                .Where(g => g.Users.Any(u => u == user) && !g.Messages.All(m => m.IsDeleted))
                .Select(g => new
                {
                    Chat = (Chat)g,
                    LastMessageTimestamp = g.Messages.OrderByDescending(m => m.Timestamp)
                                                     .Select(m => m.Timestamp)
                                                     .FirstOrDefault()
                })
                .ToList();
            var chats = dialogs.Concat(groupChats.Concat(channels))
                .OrderByDescending(c => c.LastMessageTimestamp)
                .Select(c => c.Chat)
                .ToList();


            return chats;
        }
    }
}