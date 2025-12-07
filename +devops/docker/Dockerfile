FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS runtime-base

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y curl ffmpeg webp libkrb5-3 python3 unzip && rm -rf /var/lib/apt/lists/*

# Install Deno
RUN curl -L https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp


FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS build-env
WORKDIR /app

COPY *.sln ./
COPY dotnet-tools.json ./

RUN dotnet tool restore

# Copy project files first for better layer caching
COPY Api/*.csproj ./Api/
COPY Application/*.csproj ./Application/
COPY Domain/*.csproj ./Domain/
COPY Infrastructure/*.csproj ./Infrastructure/

RUN dotnet restore -r linux-x64

# Copy source code
COPY Api/ ./Api
COPY Application/ ./Application
COPY Domain/ ./Domain
COPY Infrastructure/ ./Infrastructure

# Build and publish the application
RUN dotnet publish Api -c Release -r linux-x64 \
    -o /app/out

# Create EF migrations bundle (self-contained)
ENV ConnectionStrings__DefaultConnection=Host=localhost;Database=reezer;Username=root;Password=root
RUN dotnet ef migrations bundle --project Api \
    -r linux-x64 \
    --configuration Release \
    -o /app/out/efbundle


FROM runtime-base AS runtime
WORKDIR /app

# Copy neccesary assets
COPY --chown=appuser:appuser --from=build-env /app/out ./
COPY --chown=appuser:appuser Web/build ./wwwroot
COPY --chown=appuser:appuser +devops/docker/docker-entrypoint.sh ./

# Make scripts executable
RUN chmod +x ./docker-entrypoint.sh ./efbundle

ENTRYPOINT ["./docker-entrypoint.sh"]
