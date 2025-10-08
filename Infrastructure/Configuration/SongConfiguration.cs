using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reezer.Domain.Entities.Songs;

namespace Reezer.Infrastructure.Configuration;

public class SongConfiguration : IEntityTypeConfiguration<Song>
{
    public void Configure(EntityTypeBuilder<Song> builder)
    {
        builder.Property(s => s.Id).ValueGeneratedOnAdd();
    }
}
