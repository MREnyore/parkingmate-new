using ParkingMate.ServiceInterface;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Serve static files first
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Log static file requests for debugging
        Console.WriteLine($"[Static File] Serving: {ctx.Context.Request.Path}");
    }
});

// ServiceStack middleware - but configure it to ONLY handle specific routes
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    
    // Only let ServiceStack handle these specific paths
    var isServiceStackRoute = path.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
                              path.StartsWith("/auth", StringComparison.OrdinalIgnoreCase) ||
                              path.StartsWith("/metadata", StringComparison.OrdinalIgnoreCase) ||
                              path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) ||
                              path.StartsWith("/openapi", StringComparison.OrdinalIgnoreCase);
    
    if (isServiceStackRoute)
    {
        Console.WriteLine($"[ServiceStack] Handling: {path}");
        // Let ServiceStack handle it
        await next();
    }
    else
    {
        Console.WriteLine($"[SPA] Frontend route: {path}");
        // Serve index.html for SPA routes
        context.Request.Path = "/index.html";
        await next();
    }
});

// Configure ServiceStack
app.UseServiceStack(new AppHost());

app.Run();