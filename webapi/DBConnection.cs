using Microsoft.EntityFrameworkCore;
using webapi.Entities;

namespace webapi {
    public class ApplicationContext : DbContext
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Chat> Chats { get; set; } = null!;
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

            modelBuilder.Entity<Chat>()
                .HasKey(r => r.Id);
            modelBuilder.Entity<Chat>()
                .HasMany(b => b.Users)
                .WithMany(s => s.Chats)
                .UsingEntity(j => j.ToTable("Enrollments"));
            modelBuilder.Entity<Chat>()
                .HasMany(b => b.Messages);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender);
            modelBuilder.Entity<User>().HasData(
                    new User { Name = "Tom", Login = "User1", Password = "1111"},
                    new User { Name = "Bob", Login = "User2", Password = "1111"},
                    new User { Name = "Sam", Login = "User3", Password = "1111"}
            );
        }
    }
}