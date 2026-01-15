using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Models;

namespace IsYonetim.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMessage> ProjectMessages => Set<ProjectMessage>();
    public DbSet<Agenda> Agendas => Set<Agenda>();
    public DbSet<AgendaMessage> AgendaMessages => Set<AgendaMessage>();
    public DbSet<Pending> Pendings => Set<Pending>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<Cenaze> Cenazes => Set<Cenaze>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.Property(e => e.Department).HasMaxLength(200);
        });

        // Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.Budget).HasPrecision(18, 2);
            entity.HasOne(e => e.CreatedBy).WithMany().HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);
        });

        // ProjectMessage
        modelBuilder.Entity<ProjectMessage>(entity =>
        {
            entity.HasOne(e => e.Project).WithMany(p => p.Messages).HasForeignKey(e => e.ProjectId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Agenda
        modelBuilder.Entity<Agenda>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.HasOne(e => e.CreatedBy).WithMany().HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);
        });

        // AgendaMessage
        modelBuilder.Entity<AgendaMessage>(entity =>
        {
            entity.HasOne(e => e.Agenda).WithMany(a => a.Messages).HasForeignKey(e => e.AgendaId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Pending
        modelBuilder.Entity<Pending>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.RequesterName).HasMaxLength(100);
            entity.Property(e => e.RequesterPhone).HasMaxLength(20);
            entity.HasOne(e => e.CreatedBy).WithMany().HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.AssignedTo).WithMany().HasForeignKey(e => e.AssignedToId).OnDelete(DeleteBehavior.SetNull);
        });

        // Schedule
        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.HasOne(e => e.CreatedBy).WithMany().HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);
        });

        // Cenaze
        modelBuilder.Entity<Cenaze>(entity =>
        {
            entity.Property(e => e.DeceasedName).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Mahalle).HasMaxLength(100);
            entity.HasOne(e => e.CreatedBy).WithMany().HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);
        });

        // Notification
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
