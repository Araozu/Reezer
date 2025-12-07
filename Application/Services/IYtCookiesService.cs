namespace Reezer.Application.Services;

public interface IYtCookiesService
{
    Task SaveCookiesAsync(string text, CancellationToken cancellationToken = default);
}
