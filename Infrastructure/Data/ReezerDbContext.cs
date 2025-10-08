using Microsoft.EntityFrameworkCore;
using Reezer.Domain.Entities;

namespace Reezer.Infrastructure.Data;

public class ReezerDbContext : DbContext
{
    public DbSet<Song> Songs { get; set; }

    public ReezerDbContext(DbContextOptions<ReezerDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReezerDbContext).Assembly);
}
