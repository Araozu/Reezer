using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Reezer.Application.Services;
using Reezer.Domain.Repositories;
using Reezer.Domain.Repositories.Room;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;
using Reezer.Infrastructure.Repositories;
using Reezer.Infrastructure.Repositories.Room;
using Reezer.Infrastructure.Services;

namespace Reezer.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        // Add PostgreSQL DbContext
        services.AddDbContext<ReezerDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        // Register options
        services
            .AddOptions<StorageOptions>()
            .Bind(configuration.GetSection("Storage"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // Register HttpContextAccessor for authentication
        services.AddHttpContextAccessor();

        // Register repositories
        services.AddScoped<ISongRepository, SongRepository>();
        services.AddScoped<IAlbumRepository, AlbumRepository>();
        services.AddScoped<IArtistRepository, ArtistRepository>();
        services.AddScoped<IYtSongRepository, YtSongRepository>();

        // Register MusicRoomRepository as Singleton and for both interfaces
        services.AddSingleton<MusicRoomRepository>();
        services.AddSingleton<IMusicRoomRepository>(sp =>
            sp.GetRequiredService<MusicRoomRepository>()
        );
        services.AddSingleton<IConnectionManager>(sp =>
            sp.GetRequiredService<MusicRoomRepository>()
        );

        // Register services
        services.AddScoped<ILibraryInitializationService, LibraryInitializationService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IYtService, YtService>();
        services.AddHostedService<LibraryInitializationHostedService>();

        return services;
    }
}
