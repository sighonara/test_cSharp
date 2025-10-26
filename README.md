# Plant Manager Demo

Full-stack plant CRUD application demonstrating ASP.NET Core Web API with Angular 20 frontend.

---
## Instillation Instructions for Oct 27th, 2025 (Windows).
(This was tested on Windows 11 Pro)

1. Bring up the Command Prompt. By default, it will start in your user directory.
2. Install prerequisites. These can be done anywhere, so if we do these steps in the user directory, that's fine.
   1. git: `winget install --id Git.Git -e --source winget`
      1. This installed git 2.51.1 when I tested this on a fresh Windows 11 Pro install.
      2. The version I developed with was 2.50.1, but this shouldn't matter.
   2. .NET SDK 8.x `winget install Microsoft.DotNet.SDK.8`
      1. .NET 9 is probably fine, but I haven't tested it
      2. This installed .NET 8.0.415 for when I tested this on a fresh Windows 11 Pro install.
      3. The version I developed against was 8.0.100, but this shouldn't matter.
   3. Node.js 20.x or greater `winget install OpenJS.NodeJS`
      1. This installed Node.js 25.0.0 when I tested this on a fresh Windows 11 Pro install.
      2. The version I developed against was 22.21.0, but this shouldn't matter.
3. Choose where you want to clone the project. Navigate to that directory.
4. `Git clone https://github.com/sighonara/test_cSharp.git`
   1. This will create a new directory called `test_cSharp` in the current directory. This new directory will be referred to as `<project root>` from now on.
5. ⚠️ **If using PowerShell** ⚠️: You'll need to set permissions appropriately to run the remaining scripts. That can be done with:  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
6. `cd <project root>; dotnet run` (PowerShell < version 7) or `cd <project root> && dotnet run` (Command Prompt or PowerShell version >= 7). This will install any necessary dependencies and start the backend application.
7. The previous command will occupy the Command Prompt window. To continue, you will need a new window. This can be done by either:
   1. Pressing the Windows key and typing "cmd" and choosing "Command Prompt" from the list.
   2. Clicking on the "+" on the top of the Command Prompt window. This will create a new tab. Every time I do this, the new tab is a PowerShell window. ⚠️**NOTE**⚠️ If you end up with a PowerShell window, you'll need to run the command at item #5 to run the rest of the commands. 
8. `cd <project root>\client-app; npm install` (PowerShell < version 7) or `cd <project root>\client-app && npm install` (Command Prompt or PowerShell version >= 7) (depending on what kind of command line window is being used). This will install any necessary dependencies for the frontend application.
9. `npx ng serve`. This will start the frontend application.
10. Open a browser and navigate to `http://localhost:4200/` to view the application.
11. Optional: The swagger endpoint is available at `http://localhost:5155/swagger/index.html`.
12. Optional: The application can also be accessed from a remote machine. To do this, you'll need to modify the following:
    1. Instead of `npx ng serve` (item #9), run `npx ng serve --host 0.0.0.0`
    2. You'll need to get the IP address of the machine running the application. Navigate to `http://<ip address>:4200/` in the remote browser.

---

## Features
- **System Status Dashboard**: 37 real-time health checks including API endpoints, external services, browser capabilities, and system info
- **Plant Manager**: Full CRUD operations with search, comparison mode, and alphabetical sorting
- **Separation of Concerns**: C# backend handles data, Angular frontend handles presentation

## Prerequisites:
### C# backend
- .NET SDK 8.0+ installed (tested with 8.0.121)
### Angular frontend
- Node.js 20+. Tested with v22.21.0

## Quick Start
### Backend (from repository root)
```bash
dotnet restore
dotnet run (default accessible outside the localhost machine)
```

API available at http://localhost:5155/[endpoint]
Swagger UI available at http://localhost:5155/swagger/index.html

### Frontend (from repository root)
```bash
cd client-app
npm install
ng serve (ng serve ----host 0.0.0.0 to make it accessible from outside the localhost machine)
```

App available at http://localhost:4200/

## Build and Deploy (from repository root)
### Backend
```bash
dotnet build -c Release
dotnet publish -c Release -r [appropriate OS flog] --self-contained false -o out
```

### Frontend
```bash
cd client-app
ng build  # Output in dist/ directory
```

## Architecture
- **Backend**: ASP.NET Core 8.0 minimal Web API with in-memory data persistence
- **Frontend**: Angular 20 standalone components with Material Design 3
- **State Management**: Angular signals with reactive forms
- **Styling**: CSS variables leveraging Material Design system tokens

## Testing

### Frontend Tests
The Angular application includes unit tests for services using Jasmine and Karma.

```bash
cd client-app

# Run tests interactively (opens browser, watches for changes)
ng test

# Run tests once in headless mode (CI/CD)
ng test --watch=false --browsers=ChromeHeadless
```

**Current Coverage:**
- `PlantService`: All CRUD operations (GET, POST, PUT, DELETE) with HTTP mocking
- `App`: Component creation, navigation elements, router outlet

### Backend Tests
Backend unit tests implemented with xUnit and Moq.

```bash
cd test_cSharp.Tests && dotnet test
```

**Current Coverage:**
- `PlantService`: CRUD operations, duplicate handling, case-insensitive lookups, renaming
- `PlantsController`: HTTP response codes, validation, error handling

## Future Improvements

### Testing & Quality Assurance
- **E2E Tests**: Full user journey testing with tools like Playwright or Cypress [#1](https://github.com/sighonara/test_cSharp/issues/1)

### Data Persistence & Synchronization
- **Database Integration**: Replace in-memory JSON storage with SQL/NoSQL database [#2](https://github.com/sighonara/test_cSharp/issues/2)
- **Real-time Synchronization**: WebSocket support for multi-user concurrent editing [#3](https://github.com/sighonara/test_cSharp/issues/3)
- **Optimistic Concurrency Control**: Handle simultaneous updates with versioning/ETags [#4](https://github.com/sighonara/test_cSharp/issues/4)
- **Data Validation**: Server-side and database validation beyond basic existence checks [#5](https://github.com/sighonara/test_cSharp/issues/5)

### Security & Authentication
- **Authentication & Authorization**: User login, role-based access control (RBAC) [#6](https://github.com/sighonara/test_cSharp/issues/6)
- **Input Sanitization**: XSS prevention, SQL injection protection [#7](https://github.com/sighonara/test_cSharp/issues/7)
- **CORS Configuration**: Environment-specific CORS policies (not just localhost) [#8](https://github.com/sighonara/test_cSharp/issues/8)
- **Rate Limiting**: API throttling to prevent abuse [#9](https://github.com/sighonara/test_cSharp/issues/9)
- **HTTPS**: Get HTTPS working [#37](https://github.com/sighonara/test_cSharp/issues/37)

### Observability & Monitoring
- **Structured Logging**: Serilog or similar with contextual information [#10](https://github.com/sighonara/test_cSharp/issues/10)
- **Application Performance Monitoring**: Integration with Application Insights or similar [#11](https://github.com/sighonara/test_cSharp/issues/11)
- **Error Tracking**: Centralized error logging and alerting [#12](https://github.com/sighonara/test_cSharp/issues/12)
- **Health Check Endpoints**: Standard `/health` and `/ready` endpoints for orchestrators [#13](https://github.com/sighonara/test_cSharp/issues/13)

### User Experience Enhancements
- **Pagination**: Prevent an endless scroll of data [#14](https://github.com/sighonara/test_cSharp/issues/14)
- **Advanced Filtering**: Multi-field search, date ranges, custom filters [#15](https://github.com/sighonara/test_cSharp/issues/15)
- **Undo/Redo**: Action history for user operations [#16](https://github.com/sighonara/test_cSharp/issues/16)
- **Bulk Operations**: Multi-select delete, bulk edit capabilities [#17](https://github.com/sighonara/test_cSharp/issues/17)
- **Export/Import**: CSV/JSON data export and import functionality [#18](https://github.com/sighonara/test_cSharp/issues/18)
- **Offline Support**: Progressive Web App (PWA) with service workers [#19](https://github.com/sighonara/test_cSharp/issues/19)
- **Column Sorting**: Add sorting by column [#20](https://github.com/sighonara/test_cSharp/issues/20)
- **Responsive Design**: Ensure phones can still use the site [#21](https://github.com/sighonara/test_cSharp/issues/21)
- **Dark Mode**: Dark theme support [#22](https://github.com/sighonara/test_cSharp/issues/22)
- **Accessibility**: Compliance with the most recent standards [#23](https://github.com/sighonara/test_cSharp/issues/23)
- **Localization**: Internationalization support (very low priority) [#24](https://github.com/sighonara/test_cSharp/issues/24)
- **24-Hour Time**: Find and implement a real solution [#38](https://github.com/sighonara/test_cSharp/issues/38)
- **Better Comparison Mode**: Gradient in the comparison between the two items. [#40](https://github.com/sighonara/test_cSharp/issues/40)

### Performance & Scalability
- **Caching Strategy**: Redis or in-memory caching for frequently accessed data [#25](https://github.com/sighonara/test_cSharp/issues/25)
- **API Versioning**: Backward compatibility for API evolution [#26](https://github.com/sighonara/test_cSharp/issues/26)
- **CDN Integration**: Static asset delivery optimization [#27](https://github.com/sighonara/test_cSharp/issues/27)
- **Lazy Loading**: On-demand module loading in Angular [#28](https://github.com/sighonara/test_cSharp/issues/28)
- **Connection Pooling**: Efficient database connection management [#29](https://github.com/sighonara/test_cSharp/issues/29)
- **DB Entity Pagination**: Efficient database query optimization [#35](https://github.com/sighonara/test_cSharp/issues/35)
- **Configurable Settings**: Possibly based on environment. Possibly for testing or dev purposes. [#39](https://github.com/sighonara/test_cSharp/issues/39)

### DevOps & Deployment
- **CI/CD Pipeline**: Automated build, test, and deployment [#30](https://github.com/sighonara/test_cSharp/issues/30)
- **Containerization**: Docker images for consistent deployment [#31](https://github.com/sighonara/test_cSharp/issues/31)
- **Cloud Deployment**: Azure App Service deployment [#32](https://github.com/sighonara/test_cSharp/issues/32)
- **Environment Configuration**: Staging/Prod configuration management [#33](https://github.com/sighonara/test_cSharp/issues/33)
- **Infrastructure as Code**: Terraform or ARM templates [#34](https://github.com/sighonara/test_cSharp/issues/34)
