using Microsoft.AspNetCore.Mvc;

namespace RezerV4.Api.Utils;

public class GlobalExceptionHandlerMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionHandlerMiddleware> logger
)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred");

            // Clear any previous response
            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var response = new ProblemDetails
            {
                Status = 500,
                Title = "Error interno del servidor",
                Detail = "Error interno del servidor",
                Extensions = new Dictionary<string, object?>()
                {
                    {
                        "Details",
                        context.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment()
                        == true
                            ? ex.ToString()
                            : null
                    },
                },
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}

public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app) =>
        app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
}
