using Funq;
using ServiceStack.Auth;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using ParkingMate.ServiceModel;
using ParkingMate.ServiceInterface;
using SendGrid;
using System.Data;
using ServiceStack;
using ServiceStack.Api.OpenApi;

namespace ParkingMate;

public class AppHost() : AppHostBase("ParkingMate", typeof(ParkingMate.ServiceInterface.DataHubServices).Assembly)
{
    public override void Configure(Container container)
    {
        // Configure ServiceStack, Run custom logic after ASP.NET Core Startup
        SetConfig(new HostConfig {
            AllowFileExtensions = { "png", "jpg", "jpeg" },
            UseSameSiteCookies = true,
            UseSecureCookies = false
        });

        // Disable ServiceStack's predefined /api route to prevent conflicts with custom routes
        ConfigurePlugin<PredefinedRoutesFeature>(feature => feature.JsonApiRoute = null);

        // Configure JSON serialization to include null values
        ConfigureSerialization(container);

        // Configure Database Connection
        var connectionString = AppSettings.GetString("ConnectionStrings:DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine("ERROR: No database connection string found!");
            Console.WriteLine("Please add a PostgreSQL connection string to appsettings.json:");
            Console.WriteLine(@"{
  ""ConnectionStrings"": {2
    ""DefaultConnection"": ""Host=localhost;Database=parkingmate_dev;Username=postgres;Password=postgres""
  }
}");
            Console.WriteLine("\nFor Supabase, use your Supabase connection string instead.");
            throw new InvalidOperationException("Database connection string is required.");
        }

        var dbFactory = new OrmLiteConnectionFactory(connectionString, PostgreSqlDialect.Provider);
        container.Register<IDbConnectionFactory>(c => dbFactory);

        // Initialize Database Tables
        InitializeDatabase(dbFactory);

        // Configure CORS for React frontend
        Plugins.Add(new CorsFeature(
            allowOriginWhitelist: new[] {
                "http://localhost:5173",  // Vite dev server
                "https://localhost:5173", // Vite dev server (HTTPS)
                "https://localhost:5001", // Same-origin (when serving built app)
                "http://localhost:5001"   // Same-origin (HTTP)
            },
            allowCredentials: true,
             allowedHeaders: "Content-Type, Authorization, Accept, Accept-Language",
            allowedMethods: "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        ));


        // Configure Authentication
        Plugins.Add(new AuthFeature(() => new AuthUserSession(),
            new IAuthProvider[] {
                new CredentialsAuthProvider(),
                new JwtAuthProvider(AppSettings) {
                    AuthKeyBase64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("MySecretKey123456789")),
                    RequireSecureConnection = false, // For development only
                    AllowInQueryString = true, // Allow JWT in query string for UI
                    AllowInFormData = true // Allow JWT in form data for UI
                }
            }));

        // Configure Auth Repository (persistent PostgreSQL storage)
        var authRepo = new OrmLiteAuthRepository(dbFactory);
        container.Register<IAuthRepository>(c => authRepo);

        // Initialize auth tables
        authRepo.InitSchema();

        // Add development test user
        CreateTestUser(authRepo);

        // Configure SendGrid
        ConfigureSendGrid(container);

        // Configure reCAPTCHA
        ConfigureReCaptcha(container);

        // Configure OpenAPI
        Plugins.Add(new OpenApiFeature
        {
            ApiDeclarationFilter = api =>
            {
                api.Info.Title = "ParkingMate API";
                api.Info.Version = "v1";
                api.Info.Description = "Comprehensive parking management system with customer authentication, car management, and parking session tracking.";
                api.Info.Contact = new ServiceStack.Api.OpenApi.Specification.OpenApiContact
                {
                    Name = "ParkingMate Support",
                    Email = "support@parkingmate.com"
                };
            }
        });
    }

    private static void InitializeDatabase(IDbConnectionFactory dbFactory)
    {
        try
        {
            using var db = dbFactory.Open();
            db.CreateTableIfNotExists<Organization>();
            db.CreateTableIfNotExists<Customer>();
            db.CreateTableIfNotExists<ParkingLot>();
            db.CreateTableIfNotExists<Car>();
            db.CreateTableIfNotExists<CameraEvent>();
            db.CreateTableIfNotExists<ParkingSession>();
            db.CreateTableIfNotExists<Penalty>();
            db.CreateTableIfNotExists<RegistrationToken>();
            db.CreateTableIfNotExists<OtpToken>();
            db.CreateTableIfNotExists<RefreshTokenEntity>();
            db.CreateTableIfNotExists<Guest>();

            // Run database migrations
            RunDatabaseMigrations(db);

            System.Console.WriteLine("Database tables initialized successfully");
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"Error initializing database: {ex.Message}");
            throw;
        }
    }

    private static void CreateTestUser(IAuthRepository authRepo)
    {
        try
        {
            // Check if test user already exists
            var existingUser = authRepo.GetUserAuthByUserName("vlad.crishan20");
            if (existingUser != null)
            {
                System.Console.WriteLine("Test user already exists, skipping creation");
                return;
            }

            // Create a test user for development
            var testUser = new UserAuth
            {
                UserName = "vlad.crishan20", // Email without @ for ServiceStack compatibility
                Email = "vlad.crishan20@gmail.com",
                FirstName = "Vlad",
                LastName = "Crishan",
                Roles = new List<string> { "Admin" },
                Meta = new Dictionary<string, string>
                {
                    // Note: OrgId will be set properly when we create organizations
                    // For now, this is a placeholder for development
                }
            };

            authRepo.CreateUserAuth(testUser, "vlad1234");
            System.Console.WriteLine("Test user created successfully");
        }
        catch (Exception ex)
        {
            // Log error but don't fail startup
            System.Console.WriteLine($"Warning: Could not create test user: {ex.Message}");
        }
    }

    private void ConfigureSendGrid(Container container)
    {
        try
        {
            var apiKey = AppSettings.GetString("SendGrid:ApiKey");

            if (string.IsNullOrEmpty(apiKey))
            {
                System.Console.WriteLine("Warning: SendGrid API key not configured. Email functionality will be disabled.");
                return;
            }

            // Register SendGrid client
            var sendGridClient = new SendGridClient(apiKey);
            container.Register<ISendGridClient>(c => sendGridClient);

            // Register email service
            container.Register<IEmailService>(c => new EmailService(
                c.Resolve<ISendGridClient>(),
                AppSettings
            ));

            System.Console.WriteLine("SendGrid email service configured successfully");
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"Warning: Could not configure SendGrid: {ex.Message}");
        }
    }

    private void ConfigureReCaptcha(Container container)
    {
        try
        {
            var secretKey = AppSettings.GetString("ReCaptcha:SecretKey");

            if (string.IsNullOrEmpty(secretKey))
            {
                System.Console.WriteLine("Warning: ReCaptcha secret key not configured. CAPTCHA validation will be disabled.");
                return;
            }

            // Register HttpClient for reCAPTCHA service
            var httpClient = new HttpClient();

            // Register reCAPTCHA service
            container.Register<IReCaptchaService>(c => new ReCaptchaService(httpClient, AppSettings));

            System.Console.WriteLine("reCAPTCHA validation service configured successfully");
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"Warning: Could not configure reCAPTCHA: {ex.Message}");
        }
    }

    private static void RunDatabaseMigrations(IDbConnection db)
    {
        try
        {
            // Migration 1: Add new customer attributes
            AddCustomerAttributesIfNotExists(db);
            
            System.Console.WriteLine("Database migrations completed");
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"Warning: Database migration failed: {ex.Message}");
        }
    }

    private static void AddCustomerAttributesIfNotExists(IDbConnection db)
    {
        try
        {
            // Add new columns one by one if they don't exist
            var columns = new[]
            {
                ("membership_status", "TEXT DEFAULT 'active'"),
                ("membership_expiry_date", "TIMESTAMP"),
                ("address", "TEXT"),
                ("postal_code", "TEXT"),
                ("city", "TEXT")
            };

            foreach (var (columnName, columnDef) in columns)
            {
                try
                {
                    db.ExecuteSql($"ALTER TABLE customers ADD COLUMN {columnName} {columnDef}");
                    System.Console.WriteLine($"Added {columnName} column to customers table");
                }
                catch (Exception ex)
                {
                    // Column might already exist, which is fine
                    if (!ex.Message.Contains("already exists") && !ex.Message.Contains("duplicate column"))
                    {
                        System.Console.WriteLine($"Warning: Could not add column {columnName}: {ex.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"Warning: Could not add customer attributes: {ex.Message}");
            // Don't throw - let the app continue
        }
    }

    private void ConfigureSerialization(Container container)
    {
        // Configure JSON serialization to use ISO8601 date format
        ServiceStack.Text.JsConfig.DateHandler = ServiceStack.Text.DateHandler.ISO8601;
        
        // Ensure dates are serialized in UTC
        ServiceStack.Text.JsConfig.AssumeUtc = true;
        ServiceStack.Text.JsConfig.AppendUtcOffset = true;
    }
}