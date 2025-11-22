using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;
using Reezer.Infrastructure.Identity;

namespace Reezer.Infrastructure.Data;

public class ReezerDbContext(DbContextOptions<ReezerDbContext> options)
    : IdentityDbContext<User>(options)
{
    public DbSet<Song> Songs { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReezerDbContext).Assembly);
    }
}
