using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Reezer.Application.Services;

namespace Reezer.Infrastructure.Services;

public class LibraryInitializationHostedService(IServiceScopeFactory scopeFactory) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var libraryInitializationService =
            scope.ServiceProvider.GetRequiredService<ILibraryInitializationService>();
        await libraryInitializationService.InitializeLibraryAsync();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
