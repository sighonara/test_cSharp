# A test-case utilizing C#

## Prerequisites:
### C# backend
- .NET SDK 8.0+ installed (tested with 8.0.121)
### Angular frontend
- Node.js 20+. Tested with v22.21.0

## Backend API (ASP.NET Core Web API)
A minimal ASP.NET Core Web API project has been scaffolded to mirror the Visual Studio "ASP.NET Core Web API" template (no front-end). It includes Swagger for API exploration in Development and 4 sample `/plants` endpoints, one for each CRUD operation.

### How to run
From the repository root:

```bash
dotnet restore TestApi/TestApi.csproj
dotnet run --project TestApi/TestApi.csproj
```

By default, the app will listen on the URLs configured in `Properties/launchSettings.json`. In Development, Swagger UI will be available at the root path (for example, https://localhost:7224/ or http://localhost:5084/), and the sample endpoints are at `/plants` (GET, POST, PUT, DELETE).

### How to build
```bash
dotnet build TestApi/TestApi.csproj -c Release
```

### How to publish (self-contained example for macOS x64)
```bash
dotnet publish TestApi/TestApi.csproj -c Release -r osx-x64 --self-contained false -o out
```
