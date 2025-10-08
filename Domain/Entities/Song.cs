namespace Reezer.Domain.Entities;

public class Song
{
    public Guid Id { get; init; }
    public string Name { get; set; }
    public string Artist { get; set; }
    public string Album { get; set; }

    // Private EF constructor
    private Song() { }
}
