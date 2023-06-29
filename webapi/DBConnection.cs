using Microsoft.EntityFrameworkCore;
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
            Database.EnsureDeleted();
            Database.EnsureCreated();
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Data Source=Chatapp.db");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Dialog>()
            .HasOne(d => d.User1);

            modelBuilder.Entity<Dialog>()
                .HasOne(d => d.User2);

            modelBuilder.Entity<Group>()
                .HasKey(g => g.Id);
            modelBuilder.Entity<Group>()
                .HasMany(g => g.Users)
                .WithMany(s => s.Groups)
                .UsingEntity(join => join.ToTable("Enrollments"));
            modelBuilder.Entity<Group>()
                .HasMany(b => b.Messages);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender);
            modelBuilder.Entity<User>().HasData(
                    new User { Name = "Tom", Login = "User1", Password = PasswordHasher.HashPassword( "1111")},
                    new User { Name = "Bob", Login = "User2", Password = PasswordHasher.HashPassword("1111") },
                    new User { Name = "Sam", Login = "User3", Password = PasswordHasher.HashPassword("1111") }
            );
        }
    }
}