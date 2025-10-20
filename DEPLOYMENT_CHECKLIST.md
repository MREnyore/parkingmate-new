# Azure Deployment Checklist

## ✅ Fixed Issues

### 1. GitHub Actions Build Failure
- **Problem**: pnpm module resolution error during build
- **Fix**: Reordered Node.js and pnpm setup, added proper caching
- **Status**: Updated in `.github/workflows/azure-webapp.yml`

### 2. Startup Script
- **Problem**: Azure was running default static site handler instead of your API
- **Fix**: Updated `startup.sh` to properly start Fastify API
- **Status**: Updated and will be deployed

### 3. Build Output Verification
- **Problem**: No verification that build succeeded before deployment
- **Fix**: Added checks to ensure `apps/api/dist` exists
- **Status**: Added to workflow

## 🔧 Required Azure Configuration

### Azure Portal Settings Required

Go to: **Azure Portal** → **parkingmate-prod** → **Configuration**

#### 1. General Settings → Startup Command
```bash
bash /home/site/wwwroot/startup.sh
```
✅ **You've already set this!**

#### 2. Application Settings (Environment Variables)

Add these in **Configuration** → **Application settings**:

```bash
# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production
WEBSITES_PORT=8080

# Database
DATABASE_URL=<your-postgresql-connection-string>

# JWT Configuration
JWT_SECRET=<generate-a-secure-32-char-minimum-secret>
JWT_ACCESS_TOKEN_EXPIRY=30m
JWT_REFRESH_TOKEN_EXPIRY=30d
JWT_ISSUER=parkingmate-api
JWT_AUDIENCE=parkingmate-client

# SendGrid Email
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@parkingmate.com
SENDGRID_FROM_NAME=ParkingMate
SENDGRID_VEHICLE_DETECTION_TEMPLATE_ID=<your-template-id>
SENDGRID_OTP_TEMPLATE_ID=<your-template-id>

# reCAPTCHA
RECAPTCHA_SECRET_KEY=<your-recaptcha-secret>

# Application URLs
APP_BASE_URL=https://parkingmate-prod.azurewebsites.net
CORS_ORIGIN=https://parkingmate-prod.azurewebsites.net

# API Configuration
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info

# Optional - Use defaults if not specified
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
REGISTRATION_TOKEN_EXPIRY_HOURS=48
GUEST_CONFIRMATION_WINDOW_MINUTES=30
GUEST_PARKING_DURATION_HOURS=24
UPLOAD_MAX_FILE_SIZE_MB=15
```

## 📋 Deployment Steps

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Fix Azure deployment configuration"
   git push origin main
   ```

2. **Monitor GitHub Actions**
   - Go to GitHub → Actions tab
   - Watch the build process
   - Verify build completes successfully

3. **Configure Azure Environment Variables**
   - Add all required environment variables listed above
   - **Critical**: Don't skip DATABASE_URL, JWT_SECRET, SENDGRID_API_KEY, RECAPTCHA_SECRET_KEY

4. **Monitor Azure Deployment**
   - After GitHub Actions completes, Azure will deploy
   - Check logs: `az webapp log tail --name parkingmate-prod --resource-group parkingmate`

5. **Verify Deployment**
   - Visit: `https://parkingmate-prod.azurewebsites.net/api/v1/docs`
   - You should see your Swagger documentation
   - Check logs for "Starting Fastify API server..."

## 🐛 Troubleshooting

### If build still fails:
```bash
# Run locally to test
pnpm install
pnpm build
```

### If Azure shows static site:
- Verify startup command is set
- Check logs for "Starting Fastify API server..."
- If you see "node /opt/startup/default-static-site.js", startup command isn't being used

### If app crashes on startup:
- Missing environment variables (check required ones above)
- Database connection issues
- Check logs: `az webapp log download --name parkingmate-prod --resource-group parkingmate --log-file logs.zip`

## 📊 Expected Log Output (Success)

When deployment works, you should see:
```
Starting ParkingMate API...
Starting Fastify API server...
Working directory: /home/site/wwwroot/apps/api
Node version: v20.19.3

╭─────────────────────────────────────────────╮
│  🚗 ParkingMate API Server                  │
│                                             │
│  Environment: production                    │
│  Port:        8080                          │
│  Docs:        http://localhost:8080/docs    │
│                                             │
╰─────────────────────────────────────────────╯
```

## 🔑 Security Notes

- **Never commit** `.env` files or secrets to Git
- Use Azure Key Vault for production secrets (optional but recommended)
- Rotate JWT_SECRET regularly
- Keep API keys secure

## ✨ Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure SSL certificate
3. Set up Application Insights for monitoring
4. Configure auto-scaling rules
5. Set up staging slot for testing
