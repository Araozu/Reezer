using Microsoft.Extensions.Options;
using Reezer.Application.Services;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class YtCookiesService(IOptions<StorageOptions> storageOptions) : IYtCookiesService
{
    private readonly StorageOptions _storageOptions = storageOptions.Value;

    public async Task SaveCookiesAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        var directory = Path.GetDirectoryName(_storageOptions.YtCookiesFile);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await using var fileStream = new FileStream(_storageOptions.YtCookiesFile, FileMode.Create, FileAccess.Write);
        await stream.CopyToAsync(fileStream, cancellationToken);
    }
}
