using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace Reezer.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register all classes ending with "Service" or "UseCase" as scoped services
        var assembly = Assembly.GetExecutingAssembly();
        var serviceTypes = assembly
            .GetTypes()
            .Where(t =>
                t is { IsClass: true, IsAbstract: false }
                && (t.Name.EndsWith("Service") || t.Name.EndsWith("UseCase"))
            )
            .ToArray();

        foreach (var type in serviceTypes)
        {
            services.AddScoped(type);
        }

        return services;
    }
}
