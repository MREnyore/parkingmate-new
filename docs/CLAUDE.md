# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParkingMate is a full-stack parking management system with an **automated license plate recognition (ALPR)** system for managing parking lots. The application consists of:

- **Backend**: .NET 9.0 ServiceStack API with PostgreSQL database
- **Frontend**: React 19 + TypeScript SPA with Vite, TanStack Query, and Tailwind CSS

The system supports **multi-tenant organizations**, **customer self-registration**, **OTP-based authentication**, and **role-based access control** (Admin/Customer roles).

## Repository Structure

This project follows **ServiceStack's monorepo pattern** with all projects at the root level:

```
parkingmate/
├── ParkingMate.sln                  # Root solution file
├── ParkingMate/                     # Host project - ServiceStack API
│   ├── Configure.AppHost.cs
│   ├── Program.cs
│   └── wwwroot/                     # Static files + production frontend build
├── ParkingMate.Client/              # React 19 + TypeScript SPA (Vite)
│   ├── src/
│   │   ├── api/                     # API integration layer
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components (admin/, customer/, self-service/)
│   │   ├── router/                  # React Router configuration
│   │   ├── stores/                  # Zustand state management
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── queries/                 # TanStack Query hooks
│   │   ├── mutations/               # TanStack Query mutation hooks
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   └── vite.config.ts               # Configured to build to ../ParkingMate/wwwroot
├── ParkingMate.ServiceInterface/    # Service implementations
├── ParkingMate.ServiceModel/        # DTOs and service contracts
├── ParkingMate.Tests/               # Unit and integration tests
├── config/                          # Shared configuration
├── docs/                            # All documentation
│   ├── CLAUDE.md                    # This file
│   ├── OPENAPI-SWAGGER.md
│   ├── REFRESH-TOKEN-AUTH.md
│   └── CUSTOMER-ATTRIBUTES-UPDATE.md
├── package.json                     # Root package.json with unified scripts
├── .gitignore                       # Unified .gitignore for both .NET and Node.js
└── README.md                        # Root README
```

## Essential Commands

All commands can now be run from the **root directory** using the unified package.json scripts:

### Unified Development Commands (from root)

```bash
# Install root dependencies (for concurrently)
yarn install

# Start both API and UI in parallel (recommended for development)
yarn dev

# Start API only
yarn dev:api

# Start UI only
yarn dev:ui

# Build both projects
yarn build

# Build API only
yarn build:api

# Build UI only (outputs to ParkingMate/wwwroot/)
yarn build:ui

# Run all backend tests
yarn test

# Generate TypeScript DTOs for frontend (requires 'x' tool installed globally)
yarn dtos

# Seed database with test data
yarn seed-db

# Force seed database (overwrites existing data)
yarn seed-db-force

# Lint frontend code
yarn lint:ui

# Fix frontend linting and formatting issues
yarn biome:fix
```

### Backend (.NET API) - Individual Commands

Run these from root or `ParkingMate/` directory:

```bash
# Build the entire solution
dotnet build

# Run the API in development mode with hot reload
cd ParkingMate && dotnet watch

# Run all tests
dotnet test

# Run specific test
dotnet test --filter "TestMethodName"
```

### Frontend (React SPA) - Individual Commands

Run these from `ParkingMate.Client/` directory:

```bash
# Install dependencies
yarn install --frozen-lockfile

# Start development server (http://localhost:5173)
yarn dev

# Build for production (outputs to ../ParkingMate/wwwroot/)
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint

# Fix linting and formatting issues with Biome
yarn biome:fix
```

### Development Workflow

#### **Development Mode** (Hot Reload - Recommended for Development)

Run both services with hot module replacement for rapid development:

**Recommended**: Start both services from root directory
   ```bash
   yarn dev
   ```
   This will run both API and UI with color-coded output.

**Alternative**: Start services individually
1. Terminal 1: `yarn dev:api` (or `cd ParkingMate && dotnet watch`)
2. Terminal 2: `yarn dev:ui` (or `cd ParkingMate.Client && yarn dev`)

**How it works:**
- Vite dev server runs on `http://localhost:5173` (frontend with hot reload)
- ServiceStack backend runs on `https://localhost:5001` (API)
- Vite proxies `/api` and `/auth` requests to the backend
- Changes to React code reload instantly without full page refresh

#### **Production Mode** (Single Port Deployment)

Build and serve from a single port for production-like testing:

1. Build the React app:
   ```bash
   cd ParkingMate.Client
   yarn build  # Outputs to ../ParkingMate/wwwroot/
   ```

2. Run ServiceStack (serves both API and static files):
   ```bash
   cd ../ParkingMate
   dotnet run
   ```

3. Access the app at `https://localhost:5001`

**How it works:**
- React app is built as static files in `wwwroot`
- ServiceStack serves both the frontend and API on port 5001
- No CORS needed (same origin)
- SPA fallback middleware handles React Router routes

**After modifying DTOs**: Regenerate TypeScript types
   ```bash
   yarn dtos
   # or: cd ParkingMate && x mjs
   ```

## Architecture Overview

### Backend Architecture (.NET ServiceStack)

The backend follows **ServiceStack's service-oriented architecture** with clear separation of concerns:

- **ParkingMate.ServiceModel/**: Request/response DTOs with routing attributes (e.g., `[Route("/api/parking-events", "POST")]`)
- **ParkingMate.ServiceInterface/**: Service implementations inheriting from ServiceStack's `Service` base class
- **ParkingMate/** (Host): Startup configuration, DI, middleware, and health checks

**Key Backend Services**:
- `CustomerAuthServices.cs` - OTP-based customer authentication (login, registration, OTP verification)
- `CustomerDataServices.cs` - Customer data management (plates, cars, parking sessions)
- `AuthServices.cs` - Admin authentication (credentials-based)
- `AdminServices.cs` - Admin operations (organization/user management)
- `DataHubServices.cs` - Camera event processing and ALPR integration

**Authentication System**:
- **JWT-based** with access tokens (30 min) and refresh tokens (30 days)
- **Dual authentication**: Admin (credentials) and Customer (OTP via email)
- **Token refresh endpoint**: `/api/RefreshToken` for seamless token renewal
- **Token validation endpoint**: `/api/ValidateAuthToken` for client-side validation
- Detailed implementation docs in [docs/REFRESH-TOKEN-AUTH.md](./REFRESH-TOKEN-AUTH.md)

**Database**: PostgreSQL via ServiceStack OrmLite
- Auto-creates tables on startup
- Multi-tenant with organization isolation
- Core entities: Organization, User, Customer, ParkingLot, Car, CameraEvent, ParkingSession, Penalty

**Port Configuration**:
- **Development**: Backend runs on `https://localhost:5001` (API only)
- **Production**: Backend runs on `https://localhost:5001` (serves both API and static files from `wwwroot`)
- **CORS**: Configured to allow frontend dev server at `http://localhost:5173` for development
- **SPA Fallback**: Middleware rewrites non-API routes to `index.html` for React Router

### Frontend Architecture (React + TypeScript)

The frontend is built with **React 19** and follows modern patterns:

**State Management**:
- **Zustand**: Session state (auth tokens, user data) - see `stores/sessionStore.ts`
- **TanStack Query**: Server state caching and synchronization
- **React Hook Form + Zod**: Form state and validation

**Routing & Protection**:
- **React Router 7** with declarative routing - see `router/index.tsx`
- **RouteGuard component**: Unified auth and role-based route protection
  - `requireAuth={true}` - Requires authentication
  - `allowedRoles={['Admin']}` - Role-based access control
  - `redirectIfAuth={ROUTES.HOME}` - Redirect authenticated users away from login pages

**API Integration**:
- `api/auth.ts` - Authentication endpoints (OTP, token refresh/validation, logout)
- `api/customer.ts` - Customer data operations (plates, cars)
- `api/selfService.ts` - Self-service plate submission with reCAPTCHA
- `authenticatedFetch()` helper auto-injects Bearer tokens
- Path alias: Use `@/` for imports (e.g., `import { Button } from '@/components/ui/button'`)

**Port Configuration**:
- **Development**: Frontend runs on `http://localhost:5173` with Vite dev server (hot reload)
- **Production**: Frontend is built and served by backend on `https://localhost:5001`
- **Proxy**: Vite proxies `/api` and `/auth` requests to `https://localhost:5001` in development

**Key Frontend Patterns**:
1. **Token Management**: `sessionStore.ts` handles JWT lifecycle (decode, refresh, validate, expiry)
2. **Auto Token Refresh**: `utils/tokenExpirySubscriber.ts` monitors token expiry and refreshes proactively
3. **Route Guards**: Single `RouteGuard` component handles all auth/role logic (replaces old ProtectedRoute components)
4. **API Error Handling**: Centralized error handling with user-friendly toast notifications via Sonner

**Page Organization**:
- `pages/admin/` - Admin dashboard, account, ALPR management
- `pages/customer/` - Customer login, registration, plate management
- `pages/self-service/` - Public self-service plate submission

### Cross-Stack Integration

**DTO Synchronization**:
- Backend C# DTOs are auto-generated to TypeScript via `x mjs` (ServiceStack metadata)
- Run `yarn dtos` from root (or `x mjs` from ParkingMate/) after modifying ServiceModel DTOs
- Generated types are consumed directly in ParkingMate.Client API layer

**CORS Configuration**:
- Backend pre-configured for frontend dev servers (ports 3000, 5173)
- See [ParkingMate/Configure.AppHost.cs](../ParkingMate/Configure.AppHost.cs) for CORS setup

## Key Architectural Decisions

### Authentication Flow

**Customer (OTP-based)**:
1. Customer enters email → Backend sends OTP email
2. Customer verifies OTP → Backend returns access token + refresh token
3. Frontend stores tokens in session storage (Zustand persist middleware)
4. Subsequent API calls include `Authorization: Bearer <token>`
5. Before token expires, frontend auto-refreshes using refresh token
6. On logout, refresh token is revoked server-side

**Admin (Credentials-based)**:
1. Admin enters username/password
2. ServiceStack credentials auth validates and issues JWT
3. Same token refresh/validation flow as customers

### Role-Based Access Control

Roles are embedded in JWT claims and extracted by:
- **Backend**: ServiceStack's `[Authenticate]` and custom role validation
- **Frontend**: `RouteGuard` component checks decoded JWT roles from `sessionStore`

Example frontend route protection:
```tsx
<RouteGuard requireAuth={true} allowedRoles={['Admin']}>
  <AdminDashboard />
</RouteGuard>
```

### Multi-Tenant Data Isolation

- Each organization has isolated data
- Backend services filter by `OrganizationId` from authenticated user context
- Database queries automatically scope to user's organization

## Development Tips

### When Modifying Backend DTOs

1. Make changes in `ParkingMate.ServiceModel/`
2. Rebuild backend: `dotnet build`
3. Regenerate frontend types: `npm run dtos` (from backend directory)
4. Update frontend API calls if request/response shapes changed

### When Adding New API Endpoints

1. **Backend**: Define DTO with `[Route]` attribute in ServiceModel
2. **Backend**: Implement service method in ServiceInterface
3. **Backend**: Add to `Configure.AppHost.cs` if needs special middleware/auth
4. **Backend**: Regenerate DTOs: `npm run dtos`
5. **Frontend**: Create API function in `api/` directory
6. **Frontend**: Create TanStack Query hook in `queries/` or `mutations/`
7. **Frontend**: Use in component with proper error handling

### When Adding New Frontend Routes

1. Add route constant to `types/routes.ts`
2. Create page component in appropriate `pages/` subdirectory
3. Add route to `router/index.tsx` with appropriate `RouteGuard` protection
4. Update navigation components if needed

### Testing Strategy

**Backend Testing**:
- Unit tests use `BasicAppHost` with SQLite (in-memory)
- Integration tests use `AppSelfHostBase` on localhost:2000
- Run specific tests: `dotnet test --filter "ClassName"`

**Frontend Testing**:
- Manual testing via browser (no automated tests currently)
- Use browser DevTools to monitor token refresh in Network tab

## Environment Configuration

### Backend

Requires `appsettings.Development.json` in `ParkingMate/`:
```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=parkingmate;Username=xxx;Password=xxx"
  },
  "JWT": {
    "SecretKey": "your-secret-key",
    "AccessTokenExpiryMinutes": 30,
    "RefreshTokenExpiryDays": 30
  },
  "SendGrid": {
    "ApiKey": "optional-for-email"
  }
}
```

### Frontend

**Optional** `.env` in `ParkingMate.Client/` (defaults work for development):
```env
# Optional: Override API base URL (defaults to '' for proxy in dev, same origin in prod)
VITE_API_BASE_URL=

# Required: reCAPTCHA site key for guest self-service
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

**Note**: In development, the frontend uses Vite proxy to forward API requests, so `VITE_API_BASE_URL` can be empty. In production, the frontend is served from the same origin as the API.

## Important Files to Know

### Backend
- [ParkingMate/Configure.AppHost.cs](../ParkingMate/Configure.AppHost.cs) - ServiceStack configuration, DI, CORS, auth setup
- [ParkingMate/Program.cs](../ParkingMate/Program.cs) - Application entry point
- [ParkingMate.ServiceInterface/CustomerAuthServices.cs](../ParkingMate.ServiceInterface/CustomerAuthServices.cs) - OTP authentication logic
- [ParkingMate.ServiceInterface/CustomerDataServices.cs](../ParkingMate.ServiceInterface/CustomerDataServices.cs) - Customer data operations
- [ParkingMate.ServiceModel/DatabaseModels.cs](../ParkingMate.ServiceModel/DatabaseModels.cs) - All database entity definitions

### Frontend
- [ParkingMate.Client/src/App.tsx](../ParkingMate.Client/src/App.tsx) - Root component with QueryClientProvider and Router
- [ParkingMate.Client/src/router/index.tsx](../ParkingMate.Client/src/router/index.tsx) - All application routes with guards
- [ParkingMate.Client/src/stores/sessionStore.ts](../ParkingMate.Client/src/stores/sessionStore.ts) - Authentication state management
- [ParkingMate.Client/src/components/RouteGuard.tsx](../ParkingMate.Client/src/components/RouteGuard.tsx) - Unified route protection component
- [ParkingMate.Client/src/utils/tokenExpirySubscriber.ts](../ParkingMate.Client/src/utils/tokenExpirySubscriber.ts) - Auto token refresh logic
- [ParkingMate.Client/vite.config.ts](../ParkingMate.Client/vite.config.ts) - Build configuration with code splitting

## Code Style and Conventions

### Backend (.NET)
- Use ServiceStack conventions (request/response DTOs, service methods)
- Async/await for all I/O operations
- ServiceStack OrmLite for database queries
- Return typed responses (not raw objects)

### Frontend (React)
- Functional components with hooks (no class components)
- TypeScript strict mode enabled
- Use Biome for linting/formatting (not ESLint/Prettier)
- TanStack Query for all server data fetching
- Zustand for client state (minimal usage, prefer server state)
- Tailwind CSS for styling (utility-first)
- shadcn/ui component patterns (Radix UI primitives + Tailwind)
- Husky pre-commit hooks run Biome checks automatically

## Common Gotchas

1. **Backend DTO changes not reflecting in frontend**: Run `npm run dtos` in backend directory after modifying DTOs
2. **CORS errors in development**: Ensure Vite dev server port (5173) matches backend CORS configuration
3. **Token refresh loop**: Check `tokenExpirySubscriber.ts` and ensure refresh token is valid
4. **Route protection not working**: Verify JWT contains correct roles and RouteGuard is configured properly
5. **Build splitting issues**: Manual chunks configured in `vite.config.ts` - update if adding large dependencies or new pages
6. **404 on page reload in production**: Ensure SPA fallback middleware is configured in `Program.cs` to rewrite non-API routes to `index.html`
7. **API calls failing**: Check if using correct mode:
   - **Development**: Frontend on 5173, backend on 5001, Vite proxy enabled
   - **Production**: Everything on 5001, no proxy needed
