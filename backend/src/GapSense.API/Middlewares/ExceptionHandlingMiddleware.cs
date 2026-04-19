using System.Net;
using FluentValidation;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace GapSense.API.Middlewares;

public sealed class ExceptionHandlingMiddleware : IMiddleware
{
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            if (context.Response.HasStarted)
            {
                throw;
            }

            var (statusCode, message) = MapException(ex);

            context.Response.Clear();
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { success = false, message });
        }
    }

    private (HttpStatusCode Status, string Message) MapException(Exception ex)
    {
        if (ex is ValidationException)
        {
            return (HttpStatusCode.BadRequest, "Validation failed.");
        }

        if (ex is KeyNotFoundException knf)
        {
            return (HttpStatusCode.NotFound, knf.Message);
        }

        if (ex is ArgumentException ae)
        {
            return (HttpStatusCode.BadRequest, ae.Message);
        }

        if (ex is DbUpdateException { InnerException: SqlException })
        {
            return (HttpStatusCode.Conflict, "Database update failed.");
        }

        var sql = FindSqlException(ex);
        if (sql is not null)
        {
            if (sql.Message.Contains("Invalid object name", StringComparison.OrdinalIgnoreCase))
            {
                return (
                    HttpStatusCode.InternalServerError,
                    "Database is missing tables (for example Semesters). From backend/src/GapSense.API run: dotnet ef database update --project ..\\GapSense.Infrastructure --startup-project .");
            }

            if (sql.Number is 18456 or 4060)
            {
                return (
                    HttpStatusCode.InternalServerError,
                    "SQL Server login or database failed. Check ConnectionStrings:DefaultConnection in appsettings.json (server name, GapSenseDb exists, Windows auth).");
            }

            var msg = _env.IsDevelopment()
                ? sql.Message
                : "A database error occurred. Check that SQL Server is running and migrations are applied.";
            return (HttpStatusCode.InternalServerError, msg);
        }

        if (_env.IsDevelopment())
        {
            return (HttpStatusCode.InternalServerError, ex.GetBaseException().Message);
        }

        return (HttpStatusCode.InternalServerError, "An unexpected error occurred.");
    }

    private static SqlException? FindSqlException(Exception? ex)
    {
        for (var e = ex; e is not null; e = e.InnerException)
        {
            if (e is SqlException s)
            {
                return s;
            }
        }

        return null;
    }
}
