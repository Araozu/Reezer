using Microsoft.Extensions.Options;
using Reezer.Application.Services;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class YtCookiesService(IOptions<StorageOptions> storageOptions) : IYtCookiesService
{
    private readonly StorageOptions _storageOptions = storageOptions.Value;

    public async Task SaveCookiesAsync(string text, CancellationToken cancellationToken = default)
    {
        var directory = Path.GetDirectoryName(_storageOptions.YtCookiesFile);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await File.WriteAllTextAsync(_storageOptions.YtCookiesFile, text, cancellationToken);
    }
}
