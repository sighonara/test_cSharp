# Plant Manager Demo

Full-stack plant CRUD application demonstrating ASP.NET Core Web API with Angular 20 frontend.

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
dotnet run
```

API available at http://localhost:5155/[endpoint]
Swagger UI available at http://localhost:5155/swagger/index.html

### Frontend (from repository root)
```bash
cd client-app
npm install
ng serve
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

## Future Improvements

### Testing & Quality Assurance
- **Unit Tests**: Component logic, service methods, validators
- **Integration Tests**: End-to-end API workflows, frontend-backend integration
- **E2E Tests**: Full user journey testing with tools like Playwright or Cypress

### Data Persistence & Synchronization
- **Database Integration**: Replace in-memory JSON storage with SQL/NoSQL database
- **Real-time Synchronization**: WebSocket support for multi-user concurrent editing
- **Optimistic Concurrency Control**: Handle simultaneous updates with versioning/ETags
- **Data Validation**: Server-side validation beyond basic existence checks

### Security & Authentication
- **Authentication & Authorization**: User login, role-based access control (RBAC)
- **Input Sanitization**: XSS prevention, SQL injection protection
- **CORS Configuration**: Environment-specific CORS policies (not just localhost)
- **Rate Limiting**: API throttling to prevent abuse

### Observability & Monitoring
- **Structured Logging**: Serilog or similar with contextual information
- **Application Performance Monitoring**: Integration with Application Insights or similar
- **Error Tracking**: Centralized error logging and alerting
- **Health Check Endpoints**: Standard `/health` and `/ready` endpoints for orchestrators

### User Experience Enhancements
- **Pagination**: Handle large datasets efficiently
- **Advanced Filtering**: Multi-field search, date ranges, custom filters
- **Undo/Redo**: Action history for user operations
- **Bulk Operations**: Multi-select delete, bulk edit capabilities
- **Export/Import**: CSV/JSON data export and import functionality
- **Offline Support**: Progressive Web App (PWA) with service workers

### Performance & Scalability
- **Caching Strategy**: Redis or in-memory caching for frequently accessed data
- **API Versioning**: Backward compatibility for API evolution
- **CDN Integration**: Static asset delivery optimization
- **Lazy Loading**: On-demand module loading in Angular
- **Connection Pooling**: Efficient database connection management

### DevOps & Deployment
- **CI/CD Pipeline**: Automated build, test, and deployment
- **Containerization**: Docker images for consistent deployment
- **Cloud Deployment**: Azure App Service, AWS, or GCP deployment guides
- **Environment Configuration**: Dev/Staging/Prod configuration management
- **Infrastructure as Code**: Terraform or ARM templates