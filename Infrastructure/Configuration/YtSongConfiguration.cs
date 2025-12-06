using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reezer.Domain.Entities.Yt;

namespace Reezer.Infrastructure.Configuration;

public class YtSongConfiguration : IEntityTypeConfiguration<YtSong>
{
    public void Configure(EntityTypeBuilder<YtSong> builder)
    {
        builder.HasKey(s => s.YtId);
        builder.Property(s => s.YtId).ValueGeneratedNever();
    }
}
