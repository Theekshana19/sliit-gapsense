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
        services.AddScoped<IStudentProfileRepository, StudentProfileRepository>();
        services.AddScoped<IStudentProfileService, StudentProfileService>();
        services.AddScoped<ISemesterRepository, SemesterRepository>();
        services.AddScoped<IAcademicModuleRepository, AcademicModuleRepository>();
        services.AddScoped<ISemesterService, SemesterService>();
        services.AddScoped<IAcademicModuleService, AcademicModuleService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IInterventionAssignmentRepository, InterventionAssignmentRepository>();
        services.AddScoped<IInterventionAssignmentService, InterventionAssignmentService>();
        services.AddScoped<IMonitoringNoteRepository, MonitoringNoteRepository>();
        services.AddScoped<IMonitoringNoteService, MonitoringNoteService>();
        services.AddScoped<IMeetingRepository, MeetingRepository>();
        services.AddScoped<IMeetingService, MeetingService>();
        services.AddScoped<IReferralRepository, ReferralRepository>();
        services.AddScoped<IReferralService, ReferralService>();
        services.AddScoped<IFollowUpTaskRepository, FollowUpTaskRepository>();
        services.AddScoped<IFollowUpTaskService, FollowUpTaskService>();
        services.AddScoped<IBatchReadinessService, BatchReadinessService>();
        services.AddScoped<IInterventionPlanRepository, InterventionPlanRepository>();
        services.AddScoped<IInterventionPlanningService, InterventionPlanningService>();
        services.AddScoped<IReportExportRepository, ReportExportRepository>();
        services.AddScoped<IReportsService, ReportsService>();
        services.AddScoped<INotificationFeedRepository, NotificationFeedRepository>();
        services.AddScoped<INotificationFeedService, NotificationFeedService>();
        services.AddScoped<ILecturerProfileRepository, LecturerProfileRepository>();
        services.AddScoped<ILecturerAcademicSettingsRepository, LecturerAcademicSettingsRepository>();
        services.AddScoped<ILecturerNotificationSettingsRepository, LecturerNotificationSettingsRepository>();
        services.AddScoped<ILecturerSecuritySettingsRepository, LecturerSecuritySettingsRepository>();
        services.AddScoped<ILecturerSettingsService, LecturerSettingsService>();

        // Validation
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<CreateRiskThresholdRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<CreateStudentProfileRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<BatchReadinessLedgerRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<CreateInterventionPlanRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<InterventionPlansSearchRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<GenerateReportRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateLecturerProfileRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateLecturerAcademicSettingsRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateLecturerNotificationSettingsRequestValidator>();
        services.AddValidatorsFromAssemblyContaining<UpdateLecturerSecuritySettingsRequestValidator>();

        return services;
    }
}

