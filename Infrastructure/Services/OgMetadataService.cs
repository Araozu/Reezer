using System.Text.RegularExpressions;
using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Domain.Repositories;

namespace Reezer.Infrastructure.Services;

public partial class OgMetadataService(HttpClient httpClient) : IOgMetadataService
{
    public async Task<OneOf<OgMetadata, NotFound, InternalError>> GetMetadataAsync(
        string url,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new NotFound($"Could not fetch URL: {response.StatusCode}");
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var title = ExtractMetaContent(html, "og:title") ?? ExtractTitleTag(html);

            if (title is null)
            {
                return new NotFound("No title found in page metadata");
            }

            var description = ExtractMetaContent(html, "og:description");
            var imageUrl = ExtractMetaContent(html, "og:image");

            return new OgMetadata(title, description, imageUrl);
        }
        catch (HttpRequestException ex)
        {
            return new InternalError($"HTTP request failed: {ex.Message}");
        }
        catch (TaskCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            return new InternalError($"Failed to fetch metadata: {ex.Message}");
        }
    }

    private static string? ExtractMetaContent(string html, string property)
    {
        var pattern = OgMetaPattern();
        var matches = pattern.Matches(html);

        foreach (Match match in matches)
        {
            var prop = match.Groups["property"].Value;
            if (prop.Equals(property, StringComparison.OrdinalIgnoreCase))
            {
                return System.Net.WebUtility.HtmlDecode(match.Groups["content"].Value);
            }
        }

        return null;
    }

    private static string? ExtractTitleTag(string html)
    {
        var match = TitleTagPattern().Match(html);
        return match.Success ? System.Net.WebUtility.HtmlDecode(match.Groups[1].Value) : null;
    }

    [GeneratedRegex(
        """<meta[^>]+property=["'](?<property>[^"']+)["'][^>]+content=["'](?<content>[^"']*)["'][^>]*>|<meta[^>]+content=["'](?<content2>[^"']*)["'][^>]+property=["'](?<property2>[^"']+)["'][^>]*>""",
        RegexOptions.IgnoreCase | RegexOptions.Singleline
    )]
    private static partial Regex OgMetaPattern();

    [GeneratedRegex(@"<title[^>]*>([^<]+)</title>", RegexOptions.IgnoreCase)]
    private static partial Regex TitleTagPattern();
}
