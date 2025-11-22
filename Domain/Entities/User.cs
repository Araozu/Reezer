namespace Reezer.Domain.Entities;

public interface IUser
{
    string Id { get; set; }
    string? UserName { get; set; }
    string? Email { get; set; }
    bool EmailConfirmed { get; set; }
    string? Name { get; set; }
}
