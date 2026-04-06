using FluentValidation;
using FluentValidation.AspNetCore;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Services;
using GapSense.Application.Validators;
using GapSense.Infrastructure.Persistence;
using GapSense.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GapSense.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGapSense(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<IPasswordHasher<object>, PasswordHasher<object>>();

        services.AddDbContext<GapSenseDbContext>(opt =>
        {
            opt.UseSqlServer(config.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IRiskThresholdRepository, RiskThresholdRepository>();
        services.AddScoped<IRiskThresholdService, RiskThresholdService>();
        services.AddScoped<IRecommendationRuleRepository, RecommendationRuleRepository>();
        services.AddScoped<IRecommendationRuleService, RecommendationRuleService>();
        services.AddScoped<IReadinessResultRepository, ReadinessResultRepository>();
        services.AddScoped<IReadinessResultService, ReadinessResultService>();

        services.AddScoped<ILecturerProfileRepository, LecturerProfileRepository>();
        services.AddScoped<ILecturerProfileService, LecturerProfileService>();
        services.AddScoped<ILecturerAcademicSettingsRepository, LecturerAcademicSettingsRepository>();
        services.AddScoped<ILecturerAcademicSettingsService, LecturerAcademicSettingsService>();
        services.AddScoped<ILecturerNotificationSettingsRepository, LecturerNotificationSettingsRepository>();
        services.AddScoped<ILecturerNotificationSettingsService, LecturerNotificationSettingsService>();
        services.AddScoped<ILecturerSecuritySettingsRepository, LecturerSecuritySettingsRepository>();
        services.AddScoped<ILecturerSecuritySettingsService, LecturerSecuritySettingsService>();
        services.AddScoped<IInAppNotificationRepository, InAppNotificationRepository>();
        services.AddScoped<IInAppNotificationService, InAppNotificationService>();

        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<CreateRiskThresholdRequestValidator>();

        return services;
    }
}

