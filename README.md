# ParkingMate

A full-stack parking management system with **automated license plate recognition (ALPR)** for managing parking lots.

![.NET](https://img.shields.io/badge/.NET-9.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![ServiceStack](https://img.shields.io/badge/ServiceStack-6.x-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🏗️ Architecture

This project follows **ServiceStack's monorepo pattern**

### Features

- 🏢 **Multi-tenant organizations**
- 👤 **Customer self-registration**
- 📧 **OTP-based authentication**
- 🔐 **Role-based access control** (Admin/Customer)
- 📸 **Automated License Plate Recognition (ALPR)**
- 🚗 **Parking session management**
- 🎫 **Guest parking permits**

## 📁 Project Structure

```
parkingmate/
├── ParkingMate.sln                  # Root solution file
├── ParkingMate/                     # ServiceStack API host
├── ParkingMate.Client/              # React SPA (builds to ParkingMate/wwwroot/)
├── ParkingMate.ServiceInterface/    # Service implementations
├── ParkingMate.ServiceModel/        # DTOs and contracts
├── ParkingMate.Tests/               # Unit and integration tests
├── config/                          # Shared configuration
├── docs/                            # All documentation
│   ├── CLAUDE.md                    # AI assistant instructions
│   ├── OPENAPI-SWAGGER.md           # API documentation setup
│   ├── REFRESH-TOKEN-AUTH.md        # Authentication implementation
│   └── CUSTOMER-ATTRIBUTES-UPDATE.md
├── package.json                     # Unified scripts for dev workflow
└── .gitignore                       # Unified .gitignore
```

## 🚀 Quick Start

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v9.0.0 - specified in packageManager)
- [PostgreSQL](https://www.postgresql.org/) database
- [ServiceStack CLI (`x` tool)](https://docs.servicestack.net/dotnet-tool) for DTO generation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tcktmt/parkingmate.git
   cd parkingmate
   ```

2. **Install root dependencies**
   ```bash
   pnpm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ParkingMate.Client
   pnpm install --frozen-lockfile
   cd ..
   ```

4. **Configure backend** - Create `ParkingMate/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=parkingmate;Username=postgres;Password=yourpassword"
     },
     "JWT": {
       "SecretKey": "your-secret-key-min-32-chars",
       "AccessTokenExpiryMinutes": 30,
       "RefreshTokenExpiryDays": 30
     },
     "SendGrid": {
       "ApiKey": "your-sendgrid-api-key",
       "SenderEmail": "your-email@domain.com",
       "SenderName": "ParkingMate",
       "VehicleDetectionTemplateId": "your-template-id"
     },
     "ReCaptcha": {
       "SecretKey": "your-recaptcha-secret-key"
     }
   }
   ```

5. **Configure frontend** - Create `ParkingMate.Client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   ```

6. **Security Note**: 
   - Never commit production credentials to version control
   - Use `appsettings.Development.json` for local development only
   - Configure production settings via environment variables or secure vaults

### Development

#### Development Mode (Hot Reload - Recommended)

**Start both API and UI** (recommended):
```bash
pnpm dev
```

This will start:
- Backend API at `https://localhost:5001`
- Frontend with hot reload at `http://localhost:5173`
- Vite proxies API requests to the backend automatically

**Or start individually**:
```bash
# Terminal 1: Start API
pnpm dev:api

# Terminal 2: Start UI (with hot reload)
pnpm dev:ui
```

#### Production Mode (Single Port)

**Build and run from one port**:
```bash
# 1. Build the frontend (outputs to ParkingMate/wwwroot/)
pnpm build:ui

# 2. Run the backend (serves both API and static files)
pnpm dev:api
```

Access the app at `https://localhost:5001`

### Building

```bash
# Build both projects
pnpm build

# Build API only
pnpm build:api

# Build UI only (outputs to ParkingMate/wwwroot/)
pnpm build:ui
```

### Testing

```bash
# Run all backend tests
pnpm test

# Or use dotnet directly
dotnet test
```

### Deployment

**Docker Container:**
```bash
# Build container image
dotnet publish --os linux --arch x64 -p:PublishProfile=DefaultContainer
```

**Kamal Deployment:**
The project includes Kamal deployment configuration in `config/deploy.yml` for easy deployment to servers:
```bash
# Deploy with Kamal (configure deploy.yml first)
kamal deploy
```

## 📜 Available Scripts

All commands can be run from the root directory:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both API and UI in parallel |
| `pnpm dev:api` | Start API only |
| `pnpm dev:ui` | Start UI only |
| `pnpm build` | Build both projects |
| `pnpm build:api` | Build API only |
| `pnpm build:ui` | Build UI only |
| `pnpm test` | Run backend tests |
| `pnpm dtos` | Generate TypeScript DTOs from C# models |
| `pnpm seed-db` | Seed database with test data |
| `pnpm seed-db-force` | Force seed database (overwrites existing) |
| `pnpm lint:ui` | Lint frontend code |
| `pnpm biome:fix` | Fix frontend linting/formatting issues |

## 🔧 Development Tools

- **ServiceStack** - Backend API framework
- **React 19** - Latest UI framework with modern features
- **Vite** - Build tool with HMR
- **TypeScript** - Type safety
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS v4** - Styling with Vite plugin
- **Radix UI** - Accessible component primitives
- **Motion** - Animation library (formerly Framer Motion)
- **Biome** - Linting and formatting
- **React Router v7** - Client-side routing
- **pnpm** - Fast, efficient package manager

## 📚 Documentation

- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Comprehensive developer guide
- **[docs/REFRESH-TOKEN-AUTH.md](docs/REFRESH-TOKEN-AUTH.md)** - Authentication implementation details
- **[docs/OPENAPI-SWAGGER.md](docs/OPENAPI-SWAGGER.md)** - API documentation setup
- **[docs/CUSTOMER-ATTRIBUTES-UPDATE.md](docs/CUSTOMER-ATTRIBUTES-UPDATE.md)** - Customer data management

## 🔐 Authentication

ParkingMate uses **dual authentication**:

- **Admin**: Credentials-based (username/password)
- **Customer**: OTP-based (email verification)

Both use JWT with:
- Access tokens (30 min expiry)
- Refresh tokens (30 day expiry)
- Auto-refresh before expiration

See [docs/REFRESH-TOKEN-AUTH.md](docs/REFRESH-TOKEN-AUTH.md) for implementation details.

## 🗄️ Database

- **PostgreSQL** with ServiceStack OrmLite
- Auto-creates tables on startup
- Multi-tenant with organization isolation

**Seed test data**:
```bash
pnpm seed-db
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.
