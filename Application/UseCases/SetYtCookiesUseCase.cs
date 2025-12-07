using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class SetYtCookiesUseCase(IYtService ytService)
{
    public async Task ExecuteAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        await ytService.SaveCookiesAsync(stream, cancellationToken);
    }
}
