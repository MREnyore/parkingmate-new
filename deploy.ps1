# Configuration
$RESOURCE_GROUP = "parkingmate"
$APP_NAME = "parkingmate-prod"
$LOCATION = "germanywestcentral"
$RUNTIME = "NODE:20-lts"  # Node.js 20 LTS
$SKU = "B1"  # Basic B1 tier (cheapest paid tier)

# Login to Azure (uncomment if not already logged in)
# az login

# Create a resource group
Write-Host "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create an App Service plan
Write-Host "Creating App Service plan..."
az appservice plan create `
  --name "$APP_NAME-plan" `
  --resource-group $RESOURCE_GROUP `
  --sku $SKU `
  --is-linux

# Create a web app
Write-Host "Creating Web App..."
az webapp create `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --plan "$APP_NAME-plan" `
  --runtime $RUNTIME

# Configure app settings (environment variables)
Write-Host "Configuring app settings..."
$appSettings = @{
    NODE_ENV = "production"
    # Add other environment variables from your .env file here
    # For example:
    # DATABASE_URL = "your_database_connection_string"
    # API_KEY = "your_api_key"
}

# Convert the hashtable to the format expected by az cli
$settingsArray = @()
foreach ($key in $appSettings.Keys) {
    $settingsArray += "$key=$($appSettings[$key])"
}

# Apply the app settings
az webapp config appsettings set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings $settingsArray

# Configure deployment source (GitHub, Azure DevOps, or local git)
Write-Host "Configuring deployment source..."
# Uncomment and modify one of the following deployment options:

# Option 1: Local Git deployment
# az webapp deployment source config-local-git `
#   --name $APP_NAME `
#   --resource-group $RESOURCE_GROUP

# Option 2: GitHub deployment (uncomment and fill in your details)
# az webapp deployment source config `
#   --name $APP_NAME `
#   --resource-group $RESOURCE_GROUP `
#   --repo-url "https://github.com/yourusername/yourrepo.git" `
#   --branch main `
#   --manual-integration

# Enable logging
Write-Host "Enabling application logging..."
az webapp log config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --application-logging filesystem `
  --level information `
  --web-server-logging filesystem

# Get the web app URL
$SITE_URL = az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv
Write-Host "Web App URL: https://$SITE_URL"

Write-Host "Deployment complete!"