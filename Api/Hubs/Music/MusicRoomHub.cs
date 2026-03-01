using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Commands;
using Reezer.Application.DTOs;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;
using Reezer.Infrastructure.Identity;

namespace Reezer.Api.Hubs.Music;

public enum MusicRoomResponses
{
    Connected,
    RoomNotFound,
    UserNotFound,
    QueueChanged,
    InvalidRequest,
    PlayStateChanged,
    RoomState,
}

[Authorize]
public class MusicRoomHub(
    ILogger<MusicRoomHub> logger,
    ISender mediator,
    UserManager<User> userManager,
    IMusicRoomRepository roomRepository
) : Hub
{
    public const string Route = "/hub/MusicRoom";

    /// <summary>
    /// Connects a user to a room.
    /// </summary>
    /// <exception cref="HubException"></exception>
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var roomId = httpContext?.Request.Query["roomId"];
        if (string.IsNullOrEmpty(roomId))
        {
            throw new HubException("Room ID is required to connect");
        }

        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User is not authenticated");
        }

        // Try connect to room
        var result = await mediator.Send(
            new ConnectToRoomCommand(
                Code: roomId!,
                UserId: Guid.Parse(userId),
                ConnectionId: Context.ConnectionId
            )
        );

        await result.Match(
            async room =>
            {
                // Send the current room state to the caller in one go
                await Groups.AddToGroupAsync(Context.ConnectionId, room.Code);
                await Clients.Caller.SendAsync(
                    MusicRoomResponses.RoomState.ToString(),
                    new MusicRoomStateDto(
                        room.Queue,
                        room.CurrentIndex,
                        room.IsPlaying,
                        room.CurrentPosition,
                        room.LastUpdateServerTime
                    )
                );
            },
            notFound =>
            {
                throw new HubException($"Room with ID {roomId} not found");
            }
        );

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await mediator.Send(new DisconnectFromRoomCommand(Context.ConnectionId));
        await base.OnDisconnectedAsync(exception);
    }

    public long SyncClock()
    {
        return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public async Task SendMessage(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            throw new HubException("Message cannot be empty");
        }

        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User is not authenticated");
        }

        var room = roomRepository.GetRoomByConnectionId(Context.ConnectionId);
        if (room == null)
        {
            throw new HubException("Room not found for this connection");
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new HubException("User not found");
        }

        var userName = user.Name ?? user.UserName ?? "Unknown";

        logger.LogInformation(
            $"Chat message from {userName} ({userId}) in room {room.Code}: {message}"
        );

        await mediator.Send(new SendChatMessageCommand(room.Code, userId, userName, message));
    }

    /// <summary>
    /// Receives a list of songs to play, adds them to the queue and plays them.
    /// </summary>
    /// <param name="songs"></param>
    /// <returns></returns>
    public async Task PlaySongList(IEnumerable<RoomSong> songs)
    {
        logger.LogInformation(
            "Playing song list: {}",
            string.Join(", ", songs.Select(s => s.Name))
        );

        var result = await mediator.Send(new PlaySongListCommand(Context.ConnectionId, songs));
        result.Switch(ok => { }, notFound => throw new HubException(notFound.Reason));
    }

    public async Task AddSongsToQueue(IEnumerable<RoomSong> songs, AddPosition position)
    {
        var result = await mediator.Send(
            new AddSongsToQueueCommand(Context.ConnectionId, songs, position)
        );
        result.Switch(ok => { }, notFound => throw new HubException(notFound.Reason));
    }

    public async Task SetQueue(IEnumerable<RoomSong> queue, int currentIndex)
    {
        var room = roomRepository.GetRoomByConnectionId(Context.ConnectionId);
        if (room == null)
        {
            throw new HubException("Room not found for this connection");
        }

        var result = await mediator.Send(
            new UpdateRoomQueueCommand(room.Code, queue, currentIndex)
        );
        result.Switch(ok => { }, notFound => throw new HubException(notFound.Reason));
    }

    public async Task SetPlayState(bool isPlaying, double? position = null)
    {
        var room = roomRepository.GetRoomByConnectionId(Context.ConnectionId);
        if (room == null)
        {
            throw new HubException("Room not found for this connection");
        }

        var result = await mediator.Send(
            new UpdatePlayStateCommand(room.Code, isPlaying, position)
        );
        result.Switch(ok => { }, notFound => throw new HubException(notFound.Reason));
    }

    public async Task SetSeek(double position)
    {
        var room = roomRepository.GetRoomByConnectionId(Context.ConnectionId);
        if (room == null)
        {
            throw new HubException("Room not found for this connection");
        }

        var result = await mediator.Send(new UpdateSeekCommand(room.Code, position));
        result.Switch(ok => { }, notFound => throw new HubException(notFound.Reason));
    }
}
