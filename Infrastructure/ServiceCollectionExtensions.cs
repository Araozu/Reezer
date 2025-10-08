using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Reezer.Application.Services;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;
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

        // Register services
        services.AddScoped<ILibraryInitializationService, LibraryInitializationService>();
        services.AddHostedService<LibraryInitializationHostedService>();

        return services;
    }
}
