# Azure Deployment Configuration

## Cross-Platform Build Strategy

### The Issue
- **bcrypt** is a native Node.js module that must be compiled for the target platform
- Building on Linux but deploying to Windows would cause runtime errors

### The Solution
✅ **Current Setup:**
- Build on `windows-latest` runner (line 22 of workflow)
- Use **pnpm** for development dependencies (fast, efficient)
- Use **npm** for production deployment package (Azure-compatible, no workspace: protocol)

### Why This Hybrid Approach?

**pnpm for Development:**
- Faster install times
- Better disk space efficiency
- Native workspace support with `workspace:*` protocol

**npm for Production Package:**
- Azure Web Apps has built-in npm support
- No `workspace:*` protocol issues in standalone package
- Native modules (bcrypt) build correctly on Windows runner

### Key Workflow Steps

1. **Install & Build** (pnpm)
   - `pnpm install --frozen-lockfile`
   - `pnpm --filter @parkingmate/api build`

2. **Create Standalone Package** (npm)
   - Strip workspace dependencies from package.json
   - `npm install --production --no-optional`
   - Package with all Windows-compiled native modules

3. **Deploy to Azure**
   - Zip contains Windows-compatible binaries
   - Ready to run on Azure Web Apps

### Verification
The workflow includes a check to verify bcrypt is properly installed before deployment.
