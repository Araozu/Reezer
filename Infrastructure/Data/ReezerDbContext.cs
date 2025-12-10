using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;
using Reezer.Domain.Entities.Yt;
using Reezer.Infrastructure.Identity;

namespace Reezer.Infrastructure.Data;

public class ReezerDbContext(DbContextOptions<ReezerDbContext> options)
    : IdentityDbContext<User>(options)
{
    public DbSet<Song> Songs { get; set; } = null!;
    public DbSet<Artist> Artists { get; set; } = null!;
    public DbSet<Album> Albums { get; set; } = null!;
    public DbSet<YtSong> YtSongs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReezerDbContext).Assembly);
    }
}
