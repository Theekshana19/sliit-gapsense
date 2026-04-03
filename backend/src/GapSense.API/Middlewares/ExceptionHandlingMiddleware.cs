using System.Net;
using FluentValidation;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace GapSense.API.Middlewares;

public sealed class ExceptionHandlingMiddleware : IMiddleware
{
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger)
    {
        _logger = logger;
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

            var (statusCode, message) = ex switch
            {
                ValidationException => (HttpStatusCode.BadRequest, "Validation failed."),
                DbUpdateException { InnerException: SqlException } => (HttpStatusCode.Conflict, "Database update failed."),
                _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred."),
            };

            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { success = false, message });
        }
    }
}

