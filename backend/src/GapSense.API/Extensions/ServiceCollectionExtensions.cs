using FluentValidation;
using FluentValidation.AspNetCore;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Services;
using GapSense.Application.Validators;
using GapSense.Infrastructure.Persistence;
using GapSense.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace GapSense.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGapSense(this IServiceCollection services, IConfiguration config)
    {
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

        // Validation
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<CreateRiskThresholdRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateRiskThresholdRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<CreateRecommendationRuleRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateRecommendationRuleRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<CreateReadinessResultRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateReadinessResultRequestValidator>();

        return services;
    }
}

