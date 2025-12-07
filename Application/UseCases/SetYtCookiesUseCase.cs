using Reezer.Application.Services;

namespace Reezer.Application.UseCases;

public class SetYtCookiesUseCase(IYtCookiesService ytCookiesService)
{
    public async Task ExecuteAsync(string text, CancellationToken cancellationToken = default)
    {
        await ytCookiesService.SaveCookiesAsync(text, cancellationToken);
    }
}
