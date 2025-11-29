using Microsoft.AspNetCore.Identity;
using Reezer.Domain.Entities;

namespace Reezer.Infrastructure.Identity;

public class User : IdentityUser, IUser
{
    public string? Name { get; set; }
}
