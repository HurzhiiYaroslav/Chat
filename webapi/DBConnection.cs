using Microsoft.EntityFrameworkCore;
using System;
using webapi.Entities;
using webapi.Utils;

namespace webapi {
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
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Data Source=Chatapp.db");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>()
                .HasKey(u=>u.Id);

            modelBuilder.Entity<Message>()
                .HasKey(m => m.Id);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender);
            modelBuilder.Entity<Message>()
                .HasMany(m=>m.Files);

            modelBuilder.Entity<Chat>()
                .HasKey(c => c.Id);
            modelBuilder.Entity<Chat>()
                .HasMany(b => b.Messages);

            modelBuilder.Entity<Dialog>()
                .HasBaseType<Chat>();
            modelBuilder.Entity<Dialog>()
                .HasOne(d => d.User1)
                .WithMany();
            modelBuilder.Entity<Dialog>()
                .HasOne(d => d.User2)
                .WithMany();
               

            modelBuilder.Entity<Group>()
                .HasBaseType<Chat>();
            modelBuilder.Entity<Group>()
                .HasMany(g => g.Users)
                .WithMany(s => s.Groups)
                .UsingEntity(join => join.ToTable("Enrollments"));
            modelBuilder.Entity<Group>()
                .HasMany(b => b.Messages);

            

            SeedData(modelBuilder);
        }
        protected void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                    new User { Name = "Tom", Login = "User1", Password = PasswordHasher.HashPassword("1111") },
                    new User { Name = "Bob", Login = "User2", Password = PasswordHasher.HashPassword("1111") },
                    new User { Name = "Samuel", Login = "User3", Password = PasswordHasher.HashPassword("1111") }

            );
            modelBuilder.Entity<Group>().HasData(
                new Group { Title = "uihui1"}
                    );
        }
        public Chat GetChatById(string Id)
        {
            if (Dialogs.FirstOrDefault(d => d.Id.ToString() == Id.ToUpper()) != null)
            {
                return Dialogs.FirstOrDefault(d => d.Id.ToString() == Id.ToUpper());
            }
            else if (Groups.FirstOrDefault(d => d.Id.ToString() == Id.ToUpper()) != null)
            {
                return Groups.FirstOrDefault(d => d.Id.ToString() == Id.ToUpper());
            }
            return null;

        }

        public List<Chat> GetChatsForUser(User user)
        {
            var dialogs = Dialogs
                .Include(pc => pc.User1)
                .Include(pc => pc.User2)
                .Where(pc => pc.User1 == user || pc.User2 == user)
                .Select(pc => new
                            {
                                Chat = (Chat)pc,
                                LastMessageTimestamp = pc.Messages.OrderByDescending(m => m.Timestamp)
                                                                    .Select(m => m.Timestamp)
                                                                    .FirstOrDefault()
                             })
                                .ToList();

            var groupChats = Groups
                .Include(gc => gc.Users)
                .Where(gc => gc.Users.Any(u => u == user))
                .Select(gc => new
                {
                    Chat = (Chat)gc,
                    LastMessageTimestamp = gc.Messages.OrderByDescending(m => m.Timestamp)
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