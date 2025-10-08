using Microsoft.Extensions.Hosting;
using Reezer.Application.Services;

namespace Reezer.Infrastructure.Services;

public class LibraryInitializationHostedService(
    ILibraryInitializationService libraryInitializationService
) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await libraryInitializationService.InitializeLibraryAsync();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
