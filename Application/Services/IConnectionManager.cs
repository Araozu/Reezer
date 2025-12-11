namespace Reezer.Application.Services;

public interface IConnectionManager
{
    void AddConnection(string userId, string connectionId);
    void RemoveConnection(string connectionId);
    IEnumerable<string> GetConnections(string userId);
    IEnumerable<string> GetOnlineUsers();
}
