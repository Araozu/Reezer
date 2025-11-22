namespace Acide.Perucontrol.Domain.Utils;

public record BadRequest(string Reason);

public record BadRequest<T>(T data)
    where T : notnull;

public record InternalError(string Reason);

public record InternalError<T>(T data)
    where T : notnull;
