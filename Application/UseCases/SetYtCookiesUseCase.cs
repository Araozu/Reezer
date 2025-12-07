using Reezer.Application.Services;

namespace Reezer.Application.UseCases;

public class SetYtCookiesUseCase(IYtCookiesService ytCookiesService)
{
    public async Task ExecuteAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        await ytCookiesService.SaveCookiesAsync(stream, cancellationToken);
    }
}
