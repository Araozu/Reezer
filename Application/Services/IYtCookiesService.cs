namespace Reezer.Application.Services;

public interface IYtCookiesService
{
    Task SaveCookiesAsync(Stream stream, CancellationToken cancellationToken = default);
}
