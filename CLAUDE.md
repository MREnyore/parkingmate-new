# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParkingMate is a smart parking management system built as a pnpm monorepo managed with Turborepo. The project consists of:

- **apps/api**: Fastify backend API with PostgreSQL
- **apps/web**: React frontend with Vite
- **packages/api-client**: Type-safe API client auto-generated from OpenAPI spec
- **packages/typescript-config**: Shared TypeScript configurations

## Development Commands

### Monorepo Commands (from root)

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm build                  # Build all apps
pnpm typecheck              # Type check all packages

# Linting
pnpm lint                   # Lint all packages
pnpm lint:fix               # Auto-fix linting issues
pnpm lint:fix:staged        # Fix staged files (used in pre-commit hook)

# Database Operations
pnpm db:generate            # Generate Drizzle migrations from schema changes
pnpm db:migrate             # Run pending migrations
pnpm db:studio              # Open Drizzle Studio GUI

# OpenAPI Type Generation
pnpm api:generate           # Generate TypeScript types from OpenAPI spec
pnpm openapi:generate:build # Generate API client types and build the package

# Cleanup
pnpm clean                  # Clean all build artifacts and node_modules
```

### Backend (apps/api)

```bash
cd apps/api
pnpm dev                    # Start API server with hot reload (tsx watch)
pnpm build                  # Compile TypeScript to dist/
pnpm start                  # Run production build
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open database studio
pnpm api:generate           # Generate API types from openapi.yml
```

### Frontend (apps/web)

```bash
cd apps/web
pnpm dev                    # Start Vite dev server (http://localhost:5173)
pnpm build                  # Build for production
pnpm preview                # Preview production build
```

### API Client (packages/api-client)

```bash
cd packages/api-client
pnpm build                  # Build the package
pnpm dev                    # Watch mode
pnpm api:generate           # Generate types from OpenAPI spec
```

## Architecture

### Backend Architecture (apps/api)

Three-tier architecture with clear separation of concerns:

**Routes** ([apps/api/src/routes/](apps/api/src/routes/))
- Define HTTP endpoints and request/response schemas
- Register with Fastify server
- Map to controller methods
- Main router: [router.ts](apps/api/src/routes/router.ts:13-34) registers all route modules

**Controllers** ([apps/api/src/controllers/](apps/api/src/controllers/))
- Handle HTTP request/response logic
- Validate inputs using Zod schemas
- Call service layer for business logic
- Format responses according to API conventions

**Services** ([apps/api/src/services/](apps/api/src/services/))
- Business logic and data access
- Database operations via Drizzle ORM
- External integrations (email, reCAPTCHA, etc.)
- Key services:
  - [jwt.service.ts](apps/api/src/services/jwt.service.ts): JWT token generation/validation
  - [email.service.ts](apps/api/src/services/email.service.ts): SendGrid email sending
  - [customer.service.ts](apps/api/src/services/customer.service.ts): Customer management
  - [parking-session.service.ts](apps/api/src/services/parking-session.service.ts): Parking session tracking

**Database** ([apps/api/src/db/](apps/api/src/db/))
- Drizzle ORM with PostgreSQL
- Schema definitions in [schema/](apps/api/src/db/schema/) directory
- Migrations in [migrations/](apps/api/src/db/migrations/)
- Database client factory: [client.ts](apps/api/src/db/client.ts:17-31)
- Configuration: [drizzle.config.ts](apps/api/drizzle.config.ts:7-22)

**Server Setup** ([server.ts](apps/api/src/server.ts:18-117))
- Fastify instance with plugins: CORS, Helmet, JWT, Multipart, Rate limiting
- OpenAPI/Swagger documentation loaded from [openapi.yml](apps/api/openapi.yml)
- Swagger UI available at `/docs` endpoint
- Health check at `/health`

**Middleware** ([apps/api/src/middleware/](apps/api/src/middleware/))
- [auth.middleware.ts](apps/api/src/middleware/auth.middleware.ts): JWT authentication and role-based access control
- [error-handler.middleware.ts](apps/api/src/middleware/error-handler.middleware.ts): Global error handling
- [rate-limiter.middleware.ts](apps/api/src/middleware/rate-limiter.middleware.ts): Rate limiting configuration

### Frontend Architecture (apps/web)

**State Management**
- Zustand for client state ([stores/sessionStore.ts](apps/web/src/stores/sessionStore.ts))
- TanStack Query for server state (queries, mutations)

**Routing**
- React Router v7 ([router/index.tsx](apps/web/src/router/index.tsx))
- Protected routes with role-based access control

**API Integration**
- Type-safe API client from `@parkingmate/api-client` package
- API utilities in [src/api/](apps/web/src/api/) for auth, customer, admin operations
- Centralized client: [lib/api-client.ts](apps/web/src/lib/api-client.ts)

**Pages Structure**
- [pages/admin/](apps/web/src/pages/admin/): Admin portal pages
- [pages/customer/](apps/web/src/pages/customer/): Customer portal pages
- [pages/self-service/](apps/web/src/pages/self-service/): Guest/public pages

**UI Components**
- Radix UI primitives ([components/](apps/web/src/components/))
- Tailwind CSS v4 styling
- Component library patterns with shadcn/ui style

### OpenAPI-Driven Development

The project uses OpenAPI specification ([apps/api/openapi.yml](apps/api/openapi.yml)) as the source of truth:

1. **API Specification**: Define endpoints, schemas, responses in openapi.yml
2. **Type Generation**: Run `pnpm api:generate` to generate TypeScript types
3. **Frontend Integration**: Use generated types in `@parkingmate/api-client`
4. **Documentation**: Swagger UI auto-generated from spec

**Type Generation Flow**:
```
apps/api/openapi.yml
  → openapi-typescript generates types
  → packages/api-client/src/generated/api.ts
  → Used by apps/web via @parkingmate/api-client package
```

## Authentication System

The system supports two authentication flows:

### Admin Authentication
- Email/password login via [/auth/login](apps/api/src/routes/auth.routes.ts)
- Returns JWT access token and refresh token
- Implemented in [adminLogin](apps/web/src/api/auth.ts:368-468)
- Role check: Must have "Admin" role

### Customer Authentication
- Email/OTP flow (passwordless)
- Steps:
  1. Customer registration: Submit email → receive OTP
  2. OTP verification → receive JWT tokens
- Implemented in [triggerOtpCode](apps/web/src/api/auth.ts:91-140) and [verifyOtpCode](apps/web/src/api/auth.ts:143-228)
- Role check: Must have "Customer" role

**Role Isolation**: The frontend enforces role-based access by checking JWT token roles and redirecting users to appropriate login flows.

## Database Workflow

### Making Schema Changes

1. Modify schema files in [apps/api/src/db/schema/](apps/api/src/db/schema/)
2. Generate migration: `pnpm db:generate`
3. Review generated SQL in [apps/api/src/db/migrations/](apps/api/src/db/migrations/)
4. Apply migration: `pnpm db:migrate`

**Key Schema Files**:
- [users.ts](apps/api/src/db/schema/users.ts): Admin users
- [customers.ts](apps/api/src/db/schema/customers.ts): Customer accounts
- [cars.ts](apps/api/src/db/schema/cars.ts): Vehicle registration
- [parking-sessions.ts](apps/api/src/db/schema/parking-sessions.ts): Active/historical parking
- [organizations.ts](apps/api/src/db/schema/organizations.ts): Organization/tenant data

**Database Configuration**: Requires `DATABASE_URL` environment variable (PostgreSQL connection string).

## Environment Variables

Copy [.env.example](.env.example:1-51) to `.env` and configure:

**Backend**:
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: Secret for JWT signing
- `SENDGRID_API_KEY`: Email service
- `RECAPTCHA_SECRET_KEY`: Bot protection
- `PORT`, `HOST`, `API_VERSION`, `API_PREFIX`: Server config

**Frontend**:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_RECAPTCHA_SITE_KEY`: reCAPTCHA public key

**Note**: The root `.env` is shared by all apps (loaded via `dotenv-cli`).

## Code Quality Tools

- **Biome**: Fast linter/formatter replacing ESLint/Prettier
- **Configuration**: [biome.json](biome.json:1-177)
- **Git Hooks**: Husky pre-commit hooks run `lint:fix:staged`
- **TypeScript**: Strict mode enabled with shared configs

## Important Patterns

### API Response Format

All API responses follow a standard format:
```typescript
{
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
```

### Service Layer Pattern

Services should be pure business logic without HTTP concerns:
- Accept domain objects, not HTTP request objects
- Return domain objects, not HTTP responses
- Throw domain errors (caught by error handler)
- Database transactions handled within service methods

### Controller Pattern

Controllers handle HTTP-specific logic:
- Extract data from `request.body`, `request.params`, `request.query`
- Validate with Zod schemas
- Call services
- Return formatted responses

### Type-Safe API Calls

Frontend always uses the generated API client:
```typescript
import { apiClient } from '@/lib/api-client'

const result = await apiClient.login({ email, password })
if (result.success) {
  // result.data is fully typed!
}
```

## Common Tasks

### Adding a New API Endpoint

1. Update [openapi.yml](apps/api/openapi.yml) with new endpoint
2. Run `pnpm api:generate` to update types
3. Create/update route in [apps/api/src/routes/](apps/api/src/routes/)
4. Create/update controller in [apps/api/src/controllers/](apps/api/src/controllers/)
5. Create/update service in [apps/api/src/services/](apps/api/src/services/)
6. Use in frontend via `@parkingmate/api-client`

### Adding a Database Table

1. Create schema file in [apps/api/src/db/schema/](apps/api/src/db/schema/)
2. Export from [index.ts](apps/api/src/db/schema/index.ts)
3. Run `pnpm db:generate` to create migration
4. Review and run `pnpm db:migrate`
5. Create corresponding service for data access

### Adding a Frontend Page

1. Create page component in [apps/web/src/pages/](apps/web/src/pages/)
2. Add route in [apps/web/src/router/index.tsx](apps/web/src/router/index.tsx)
3. Use TanStack Query for data fetching
4. Use Zustand stores for local state if needed
