using Microsoft.AspNetCore.Http;
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
        services.Configure<StorageOptions>(configuration.GetSection("Storage"));

        // Register HttpContextAccessor for authentication
        services.AddHttpContextAccessor();

        // Register repositories
        services.AddScoped<ISongRepository, SongRepository>();
        services.AddScoped<IAlbumRepository, AlbumRepository>();
        services.AddScoped<IArtistRepository, ArtistRepository>();
        services.AddScoped<IMusicRoomRepository, MusicRoomRepository>();

        // Register services
        services.AddScoped<ILibraryInitializationService, LibraryInitializationService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddHostedService<LibraryInitializationHostedService>();

        return services;
    }
}
