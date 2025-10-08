using Microsoft.EntityFrameworkCore;
using Reezer.Domain.Entities.Songs;

namespace Reezer.Infrastructure.Data;

public class ReezerDbContext(DbContextOptions<ReezerDbContext> options) : DbContext(options)
{
    public DbSet<Song> Songs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReezerDbContext).Assembly);
}
