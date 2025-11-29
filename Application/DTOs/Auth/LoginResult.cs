namespace Reezer.Application.DTOs.Auth;

public sealed record LoginResult(bool Success, string? ErrorMessage = null);
