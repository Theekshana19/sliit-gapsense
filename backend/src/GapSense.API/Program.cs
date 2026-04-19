using GapSense.API.Extensions;
using GapSense.Application.Interfaces.Services;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    // Development: allow any origin so Angular works on any host/port (4200, 127.0.0.1, LAN IP, etc.)
    // and avoids HttpClient "status 0" when the browser blocks the response due to missing CORS headers.
    if (builder.Environment.IsDevelopment())
    {
        options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
    }
    else
    {
        options.AddPolicy(
            "Frontend",
            p => p.WithOrigins(
                    "http://localhost:4200",
                    "https://localhost:4200",
                    "http://127.0.0.1:4200",
                    "https://127.0.0.1:4200")
                .AllowAnyHeader()
                .AllowAnyMethod());
    }
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddTransient<GapSense.API.Middlewares.ExceptionHandlingMiddleware>();
builder.Services.AddGapSense(builder.Configuration);

var app = builder.Build();

// Run first so controller and downstream middleware exceptions are returned as JSON (not blank 500s).
app.UseMiddleware<GapSense.API.Middlewares.ExceptionHandlingMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GapSenseDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    await db.Database.MigrateAsync();
    try
    {
        await MonitoringDbSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Database seed failed. Continuing startup.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    app.UseCors();
}
else
{
    app.UseCors("Frontend");
}
// Default off: Angular dev-server proxies http://localhost:5120. With ASPNETCORE_ENVIRONMENT=Production,
// UseHttpsRedirection breaks that flow (307 → HTTPS / cert issues). Set "EnableHttpsRedirection": true when TLS terminates in Kestrel.
if (app.Configuration.GetValue("EnableHttpsRedirection", false))
{
    app.UseHttpsRedirection();
}


app.UseAuthorization();

app.MapControllers();

// Follow-up actions: minimal routes so POST works even if controller discovery is stale; same paths the Angular client uses.
app.MapPost(
        "/api/dashboard/follow-up-remind-all",
        async Task<IResult> (Guid semesterId, IFollowUpTaskService followUps, CancellationToken ct) =>
        {
            try
            {
                var n = await followUps.RemindAllAsync(semesterId, ct);
                return Results.Ok(new { remindedCount = n });
            }
            catch (Exception ex)
            {
                return Results.Json(
                    new { success = false, message = ex.GetBaseException().Message },
                    statusCode: StatusCodes.Status400BadRequest);
            }
        })
    .WithName("DashboardFollowUpRemindAll");

app.MapPost(
        "/api/dashboard/follow-up-dismiss-queue",
        async Task<IResult> (Guid semesterId, IFollowUpTaskService followUps, CancellationToken ct) =>
        {
            try
            {
                var n = await followUps.DismissQueueAsync(semesterId, ct);
                return Results.Ok(new { dismissedCount = n });
            }
            catch (Exception ex)
            {
                return Results.Json(
                    new { success = false, message = ex.GetBaseException().Message },
                    statusCode: StatusCodes.Status400BadRequest);
            }
        })
    .WithName("DashboardFollowUpDismissQueue");

app.Run();
