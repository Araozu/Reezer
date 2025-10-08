using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Reezer.Infrastructure.Data;

namespace Reezer.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString
    )
    {
        services.AddDbContext<ReezerDbContext>(options => options.UseNpgsql(connectionString));

        return services;
    }
}
