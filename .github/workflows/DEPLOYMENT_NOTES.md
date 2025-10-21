# Azure Deployment Configuration

## Cross-Platform Build Strategy

### Package Management
✅ **Current Setup:**
- Build on `windows-latest` runner (line 22 of workflow)
- Use **pnpm** for development dependencies (fast, efficient)
- Use **npm** for production deployment package (Azure-compatible, no workspace: protocol)
- Use **bcryptjs** instead of bcrypt (pure JavaScript, no native bindings)

### Why This Hybrid Approach?

**pnpm for Development:**
- Faster install times
- Better disk space efficiency
- Native workspace support with `workspace:*` protocol

**npm for Production Package:**
- Azure Web Apps has built-in npm support
- No `workspace:*` protocol issues in standalone package
- Simplified deployment without native module compilation

**bcryptjs for Password Hashing:**
- Pure JavaScript implementation (no native bindings)
- Cross-platform compatible
- No compilation issues when deploying to different OS environments
- Same API as bcrypt, drop-in replacement

### Key Workflow Steps

1. **Install & Build** (pnpm)
   - `pnpm install --frozen-lockfile`
   - `pnpm --filter @parkingmate/api build`

2. **Create Standalone Package** (npm)
   - Strip workspace dependencies from package.json
   - `npm install --production --no-optional`
   - All dependencies are pure JavaScript, no platform-specific builds needed

3. **Deploy to Azure**
   - Zip contains all dependencies
   - Ready to run on Azure Web Apps (Windows or Linux)
