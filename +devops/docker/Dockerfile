FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine3.22 AS runtime-base

# Install minimal runtime dependencies
# Needed for docker compose healthchecks
RUN apk add --no-cache curl ffmpeg libwebp-tools krb5-libs python3 unzip

# Install Deno
RUN curl -L https://deno.land/install.sh | sh

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp


FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine3.22 AS build-env
WORKDIR /app

COPY *.sln ./
COPY dotnet-tools.json ./

RUN dotnet tool restore

# Copy project files first for better layer caching
COPY Api/*.csproj ./Api/
COPY Application/*.csproj ./Application/
COPY Domain/*.csproj ./Domain/
COPY Infrastructure/*.csproj ./Infrastructure/


# Restore packages for the target runtime - this layer gets cached unless project files change
RUN dotnet restore -r linux-musl-x64

# Copy source code
COPY Api/ ./Api
COPY Application/ ./Application
COPY Domain/ ./Domain
COPY Infrastructure/ ./Infrastructure

# Build and publish the application
RUN dotnet publish Api -c Release -r linux-musl-x64 \
    -o /app/out

# Create EF migrations bundle (self-contained)
ENV ConnectionStrings__DefaultConnection=Host=localhost;Database=reezer;Username=root;Password=root
RUN dotnet ef migrations bundle --project Api \
    -r linux-musl-x64 \
    --configuration Release \
    -o /app/out/efbundle


FROM runtime-base AS runtime
WORKDIR /app

# Copy built application from build stage
COPY --from=build-env --chown=appuser:appuser /app/out ./

COPY --chown=appuser:appuser +devops/docker/docker-entrypoint.sh ./

# Make scripts executable
RUN chmod +x ./docker-entrypoint.sh ./efbundle

USER appuser
ENTRYPOINT ["./docker-entrypoint.sh"]
