FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5172

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy all project files first for restore
COPY GapSense.Domain/GapSense.Domain.csproj GapSense.Domain/
COPY GapSense.Application/GapSense.Application.csproj GapSense.Application/
COPY GapSense.Infrastructure/GapSense.Infrastructure.csproj GapSense.Infrastructure/
COPY GapSense.API/GapSense.API.csproj GapSense.API/

# restore dependencies
RUN dotnet restore GapSense.API/GapSense.API.csproj

# copy all source code
COPY . .

# build the API project
RUN dotnet build GapSense.API/GapSense.API.csproj -c Release -o /app/build

FROM build AS publish
RUN dotnet publish GapSense.API/GapSense.API.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5172
ENTRYPOINT ["dotnet", "GapSense.API.dll"]
