namespace Reezer.Application.DTOs.Auth;

public sealed record RegisterCommand(string Email, string Password, string Name);
