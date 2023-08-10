using Microsoft.EntityFrameworkCore;
using webapi.Entities;
using webapi.Utils;

namespace webapi
{
    public class ApplicationContext : DbContext
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Dialog> Dialogs { get; set; } = null!;
        public DbSet<Group> Groups { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            //Database.EnsureDeleted();
            Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
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
                .UsingEntity<Dictionary<string, object>>(
        "Enrollments",
        j => j
            .HasOne<User>()
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade),
        j => j
            .HasOne<Group>()
            .WithMany()
            .OnDelete(DeleteBehavior.Restrict)
    );
            modelBuilder.Entity<Group>()
                .HasMany(b => b.Messages);
            modelBuilder.Entity<Group>()
                .HasOne(g => g.Creator)
                .WithMany();

            SeedData(modelBuilder);
        }
        protected void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                    new User { Name = "Tom", Login = "User1", Password = PasswordHasher.HashPassword("1111") },
                    new User { Name = "Bob", Login = "User2", Password = PasswordHasher.HashPassword("1111") },
                    new User { Name = "Samuel", Login = "User3", Password = PasswordHasher.HashPassword("1111") }
            );
        }
        public async Task<Chat> GetChatById(string Id)
        {
            Id = Id.ToUpper();
            var dialog = await Dialogs.FirstOrDefaultAsync(d => d.Id.ToString() == Id);
            if (dialog != null)
            {
                return dialog;
            }
            var group = await Groups.FirstOrDefaultAsync(g => g.Id.ToString() == Id);
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
                .Where(d => d.User1 == user || d.User2 == user)
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
                .Where(g => g.Users.Any(u => u == user))
                .Select(g => new
                {
                    Chat = (Chat)g,
                    LastMessageTimestamp = g.Messages.OrderByDescending(m => m.Timestamp)
                                                     .Select(m => m.Timestamp)
                                                     .FirstOrDefault()
                })
                .ToList();

            var chats = dialogs.Concat(groupChats)
                .OrderByDescending(c => c.LastMessageTimestamp)
                .Select(c => c.Chat)
                .ToList();

            return chats;
        }
    }
}