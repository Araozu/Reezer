using Microsoft.EntityFrameworkCore;
using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;

namespace Reezer.Infrastructure.Data;

public class ReezerDbContext(DbContextOptions<ReezerDbContext> options) : DbContext(options)
{
    public DbSet<Song> Songs { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReezerDbContext).Assembly);
}
