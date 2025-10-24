using Reezer.Api.Hubs;
using Reezer.Application;
using Reezer.Infrastructure;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddHealthChecks();
builder.Services.AddControllers();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Allow Frontend",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .SetIsOriginAllowed(origin => true)
                .AllowCredentials();
        }
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("Allow Frontend");

// Hubs
app.MapHub<MusicHub>("api/hubs/music");

// Serve static files from wwwroot (frontend assets)
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/api/healthz");

// For SPA routing - serve index.html for non-API routes that don't match API endpoints
app.MapFallbackToFile("index.html");

app.Run();
