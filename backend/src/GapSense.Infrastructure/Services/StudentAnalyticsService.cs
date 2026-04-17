using System.Text.Json;
using GapSense.Application.DTOs;
using GapSense.Application.DTOs.Analytics;
using GapSense.Application.Services;
using System.Globalization;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class StudentAnalyticsService : IStudentAnalyticsService
{
    private static readonly JsonSerializerOptions TopicJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ApplicationDbContext _context;

    /// <summary>Merges legacy <see cref="QuizAttempt"/> rows with readiness <see cref="Submission"/> rows for the same student.</summary>
    private sealed record UnifiedAttempt(
        DateTime SubmittedAtUtc,
        int TotalScorePercent,
        IReadOnlyList<QuizTopicScoreDto> Topics,
        string ModuleLabel);

    public StudentAnalyticsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WeakTopicAnalysisViewDto> GetWeakTopicAnalysisAsync(Guid userId, string? moduleCode,
        CancellationToken cancellationToken = default)
    {
        var (topics, moduleLabel, totalScore) = await LoadTopicScoresAsync(userId, moduleCode, cancellationToken);
        if (topics.Count == 0)
        {
            topics = new List<(string Name, int Percent)> { ("No assessment data yet", 0) };
        }

        const int expected = 75;
        var matrixRows = topics.Select(t =>
        {
            var weakness = ToWeaknessLevel(t.Percent);
            return new WeakTopicMatrixRowDto
            {
                TopicName = t.Name,
                BlockLabel = $"Block: {moduleLabel}",
                CurrentScorePercent = t.Percent,
                ExpectedLevelPercent = expected,
                WeaknessLevel = weakness,
                Status = ToMatrixStatus(weakness)
            };
        }).ToList();

        var weak = topics.Count(t => t.Percent < expected);
        var critical = topics.Count(t => t.Percent < 40);

        var summary = new WeakTopicSummaryCardsDto
        {
            TotalTopicsEvaluated = topics.Count,
            TotalTopicsHelper = "From latest quiz attempt or readiness result",
            WeakTopicsIdentified = weak,
            WeakTopicsHelper = "Below benchmark",
            CriticalWeakAreas = critical,
            CriticalHelper = "Immediate study recommended"
        };

        var student = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var shortName = student?.FullName?.Split(' ')[0] ?? "Student";

        var interventionItems = topics
            .Where(t => t.Percent < expected)
            .Take(2)
            .Select(t => new InterventionItemDto
            {
                Icon = "auto_stories",
                Tone = t.Percent < 40 ? "error" : "secondary",
                Title = $"Focus: {t.Name}",
                Description = $"{shortName}, allocate time to {t.Name} (current {t.Percent}%)."
            })
            .ToList();

        if (interventionItems.Count == 0)
        {
            interventionItems.Add(new InterventionItemDto
            {
                Icon = "check_circle",
                Tone = "secondary",
                Title = "On track",
                Description = "No critical weak topics from the latest assessment."
            });
        }

        var projBars = BuildProjectionBars(totalScore);

        return new WeakTopicAnalysisViewDto
        {
            Summary = summary,
            MatrixRows = matrixRows,
            Intervention = new InterventionStrategyDto { Items = interventionItems },
            Projection = new ProjectionSummaryDto
            {
                Subtitle = "Trajectory from recent attempts (projected).",
                Bars = projBars,
                InsightTemplate = "{{name}} is projected to reach {{percent}} average readiness with targeted practice.",
                InsightHighlightPercent = Math.Clamp(totalScore + 15, 0, 95)
            }
        };
    }

    public async Task<PersonalizedRecommendationsViewDto> GetPersonalizedRecommendationsAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        var (topics, _, _) = await LoadTopicScoresAsync(userId, null, cancellationToken);
        var rules = await _context.RecommendationRules
            .AsNoTracking()
            .Where(r => r.Status == RecommendationRuleStatus.Active)
            .OrderBy(r => r.PriorityLevel)
            .ToListAsync(cancellationToken);

        var high = new List<HighPriorityRecommendationDto>();
        var medium = new List<MediumPriorityRecommendationDto>();

        foreach (var rule in rules)
        {
            foreach (var (topicName, percent) in topics)
            {
                if (!TopicMatchesRule(rule, topicName))
                    continue;
                if (!ScoreMatchesRule(rule, percent))
                    continue;

                var resInfo = MapResourceInfo(rule.ResourceType);
                if (rule.PriorityLevel == RecommendationPriorityLevel.High)
                {
                    high.Add(new HighPriorityRecommendationDto
                    {
                        Id = $"{rule.Id}:{topicName}",
                        TopicLabel = topicName,
                        Title = rule.RecommendationTitle,
                        Description = rule.AdministrativeRationale ?? $"Rule: {rule.RuleName}",
                        ResourceType = resInfo,
                        SuggestedAction = new RecommendationActionDto { Label = "Open resource" },
                        Status = "pending",
                        ResourceUrl = rule.ResourceUrl,
                        DecorativeCircle = false
                    });
                }
                else
                {
                    medium.Add(new MediumPriorityRecommendationDto
                    {
                        Id = $"{rule.Id}:{topicName}",
                        TopicLabel = topicName,
                        Title = rule.RecommendationTitle,
                        Description = rule.ModuleName,
                        ResourceTypeIcon = resInfo.Icon,
                        ResourceTypeLabel = resInfo.Label,
                        ResourceUrl = rule.ResourceUrl
                    });
                }

                break;
            }
        }

        if (high.Count == 0 && medium.Count == 0)
        {
            medium.Add(new MediumPriorityRecommendationDto
            {
                Id = "empty",
                TopicLabel = "General",
                Title = "Complete an assessment",
                Description = "Take a published quiz to unlock topic-specific recommendations.",
                ResourceTypeIcon = "quiz",
                ResourceTypeLabel = "Assessment"
            });
        }

        return new PersonalizedRecommendationsViewDto
        {
            HighPriority = new HighPriorityGroupDto
            {
                Config = new PrioritySectionConfigDto
                {
                    Title = "High priority",
                    BadgeLabel = "Urgent",
                    BadgeTone = "error"
                },
                Items = high
            },
            MediumPriority = new MediumPriorityGroupDto
            {
                Config = new PrioritySectionConfigDto
                {
                    Title = "Medium priority",
                    BadgeLabel = "Suggested",
                    BadgeTone = "secondary"
                },
                Items = medium
            },
            Insight = new RecommendationInsightDto
            {
                BadgeLabel = "Insights",
                Title = "Recommendation coverage",
                Explanation = "Rules are matched using your latest topic scores and active recommendation rules.",
                Metrics = new[]
                {
                    new RecommendationInsightMetricDto { Value = high.Count.ToString(), Label = "High priority" },
                    new RecommendationInsightMetricDto { Value = medium.Count.ToString(), Label = "Medium priority" },
                    new RecommendationInsightMetricDto { Value = rules.Count.ToString(), Label = "Active rules" }
                }
            },
            Roadmap = new RecommendationRoadmapDto
            {
                Title = "Next steps",
                Items = Enumerable.Range(1, Math.Min(4, Math.Max(high.Count + medium.Count, 3)))
                    .Select(i => new RecommendationRoadmapItemDto
                    {
                        StepNumber = i,
                        Label = i == 1 ? "Review high-priority items" : $"Step {i}",
                        Status = i == 1 ? "pending" : "pending"
                    })
                    .ToList(),
                UpdateButtonLabel = "Refresh"
            }
        };
    }

    public async Task<StudentReadinessProfileViewDto> GetStudentReadinessProfileAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var sp = await _context.StudentProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        var code = sp?.StudentId ?? userId.ToString()[..8];
        var name = user?.FullName ?? "Student";

        var rows = new List<StudentAssessmentRowDto>();
        var attempts = await _context.QuizAttempts
            .AsNoTracking()
            .Include(a => a.LegacyQuiz)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.SubmittedAtUtc)
            .Take(10)
            .ToListAsync(cancellationToken);

        var i = 0;
        foreach (var a in attempts)
        {
            rows.Add(new StudentAssessmentRowDto
            {
                Id = a.Id.ToString(),
                AssessmentName = a.LegacyQuiz.Title,
                Date = a.SubmittedAtUtc.ToString("yyyy-MM-dd"),
                Score = $"{a.TotalScorePercent}/100",
                Outcome = a.TotalScorePercent >= 60 ? "ready" : "needs_work",
                TrendDirection = "flat",
                TrendPercent = i++ == 0 ? "—" : "±0%"
            });
        }

        if (sp != null)
        {
            var submissions = await _context.Submissions
                .AsNoTracking()
                .Include(s => s.Quiz)
                .Where(s => s.StudentId == sp.StudentId)
                .Where(s => s.Status == "Submitted" || s.Status == "Graded")
                .OrderByDescending(s => s.SubmittedAt ?? s.CreatedAt)
                .Take(10)
                .ToListAsync(cancellationToken);

            foreach (var s in submissions)
            {
                var at = s.SubmittedAt ?? s.CreatedAt;
                var pct = (int)Math.Round(s.Percentage);
                rows.Add(new StudentAssessmentRowDto
                {
                    Id = s.Id.ToString(),
                    AssessmentName = s.Quiz.Title,
                    Date = at.ToString("yyyy-MM-dd"),
                    Score = $"{pct}/100",
                    Outcome = pct >= 60 ? "ready" : "needs_work",
                    TrendDirection = "flat",
                    TrendPercent = "—"
                });
            }

            var readinessRows = await _context.ReadinessResults
                .AsNoTracking()
                .Where(r => r.StudentId == sp.StudentId)
                .OrderByDescending(r => r.AnalysisDateLabel)
                .Take(5)
                .ToListAsync(cancellationToken);

            foreach (var r in readinessRows)
            {
                rows.Add(new StudentAssessmentRowDto
                {
                    Id = r.Id.ToString(),
                    AssessmentName = $"Readiness — {r.ModuleCode}",
                    Date = r.AnalysisDateLabel,
                    Score = $"{r.TotalScorePercent}/100",
                    Outcome = r.RiskLevel == "low" ? "ready" : "needs_work",
                    TrendDirection = "up",
                    TrendPercent = "+0%"
                });
            }
        }

        rows.Sort((a, b) => string.Compare(b.Date, a.Date, StringComparison.Ordinal));

        return new StudentReadinessProfileViewDto
        {
            StudentDisplayName = name,
            StudentCode = code,
            RecentAssessments = rows
        };
    }

    public async Task<PersonalizedLearningPathViewDto> GetLearningPathAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        var rec = await GetPersonalizedRecommendationsAsync(userId, cancellationToken);
        var hp = rec.HighPriority.Items;
        var mp = rec.MediumPriority.Items;
        var steps = new List<LearningPathStepItemDto>();
        var n = 1;
        foreach (var item in hp.Take(2))
        {
            steps.Add(new LearningPathStepItemDto
            {
                Id = item.Id,
                StepNumber = n++,
                Title = item.Title,
                Status = "in_progress",
                BadgeLabel = "Recommended",
                RecommendationNote = item.Description,
                ResourcePanel = new LearningPathResourcePanelDto
                {
                    Icon = item.ResourceType.Icon,
                    Title = item.ResourceType.Label,
                    Subtext = item.TopicLabel,
                    ActionLabel = "Start"
                }
            });
        }

        foreach (var item in mp.Take(2))
        {
            steps.Add(new LearningPathStepItemDto
            {
                Id = item.Id,
                StepNumber = n++,
                Title = item.Title,
                Status = "locked",
                UnlockNote = "Complete prior steps to unlock.",
                Metadata = new[]
                {
                    new LearningPathMetadataItemDto { Icon = item.ResourceTypeIcon, Label = item.ResourceTypeLabel }
                }
            });
        }

        if (steps.Count == 0)
        {
            steps.Add(new LearningPathStepItemDto
            {
                Id = "1",
                StepNumber = 1,
                Title = "Take a diagnostic quiz",
                Status = "in_progress",
                RecommendationNote = "Your path will populate from assessment data."
            });
        }

        var completed = steps.Count(s => s.Status == "completed");
        var (_, _, avg) = await LoadTopicScoresAsync(userId, null, cancellationToken);
        var resumeH = hp.FirstOrDefault();
        var resumeM = mp.FirstOrDefault();
        var resumeTitle = resumeH?.Title ?? resumeM?.Title ?? "Get started";
        var resumeTopic = resumeH?.TopicLabel ?? resumeM?.TopicLabel ?? "General";

        return new PersonalizedLearningPathViewDto
        {
            Summary = new LearningPathSummaryDto
            {
                Label = "Learning path",
                ReadinessPercent = avg,
                NextMilestoneLabel = "Next milestone",
                NextMilestoneName = resumeTitle,
                CompletedCount = completed,
                TotalCount = steps.Count,
                HelperText = "Steps are generated from recommendations matched to your topic gaps."
            },
            ResumeItem = new LearningPathResumeItemDto
            {
                Title = resumeTitle,
                TopicName = resumeTopic,
                ContinueLabel = "Continue"
            },
            Steps = steps,
            FooterActions = new LearningPathFooterActionDto
            {
                Title = "Need help?",
                Subtitle = "Contact your module coordinator for interventions.",
                PrimaryButtonLabel = "Export summary",
                SecondaryButtonLabel = "Retake quiz"
            }
        };
    }

    public async Task<ReassessmentComparisonViewDto> GetReassessmentComparisonAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        var ascending = await GetUnifiedAttemptsAscendingAsync(userId, cancellationToken);
        var orderedDesc = ascending.OrderByDescending(a => a.SubmittedAtUtc).ToList();

        if (orderedDesc.Count == 0)
        {
            var emptyScore = new ReassessmentScoreSummaryDto
            {
                Label = "Attempt",
                Title = "No attempts yet",
                SessionDate = "—",
                RiskBadge = "Moderate Risk",
                ScorePercent = 0,
                IsHighRisk = true
            };

            return new ReassessmentComparisonViewDto
            {
                ImprovementDelta = new ReassessmentImprovementDto { Label = "Improvement", Message = "Submit a quiz to see comparison." },
                Attempt1Score = emptyScore,
                ReassessmentScore = emptyScore,
                TopicComparisons = Array.Empty<ReassessmentTopicComparisonDto>(),
                TopicBreakdown = Array.Empty<ReassessmentTopicBreakdownDto>(),
                Observation = new ReassessmentObservationDto { Label = "Note", Text = "No reassessment data available." },
                CertificateAction = new ReadinessCertificateActionDto
                {
                    Title = "Certificate",
                    Subtitle = "Available after passing attempts.",
                    ButtonLabel = "Download"
                }
            };
        }

        var latest = orderedDesc[0];
        var previous = orderedDesc.Count > 1 ? orderedDesc[1] : latest;

        var tLatest = latest.Topics;
        var tPrev = previous.Topics;
        var topicNames = tLatest.Select(t => t.TopicName).Union(tPrev.Select(t => t.TopicName)).Distinct().ToList();

        var comparisons = new List<ReassessmentTopicComparisonDto>();
        var breakdown = new List<ReassessmentTopicBreakdownDto>();
        foreach (var name in topicNames)
        {
            var p = tPrev.FirstOrDefault(x => x.TopicName == name)?.Percent ?? 0;
            var l = tLatest.FirstOrDefault(x => x.TopicName == name)?.Percent ?? 0;
            var growth = l - p;
            comparisons.Add(new ReassessmentTopicComparisonDto
            {
                TopicName = name,
                Attempt1Percent = p,
                ReassessmentPercent = l,
                GrowthText = growth >= 0 ? $"+{growth} pts" : $"{growth} pts"
            });
            breakdown.Add(new ReassessmentTopicBreakdownDto
            {
                TopicName = name,
                BeforePercent = p,
                AfterPercent = l,
                ImprovementPercent = growth
            });
        }

        var delta = latest.TotalScorePercent - previous.TotalScorePercent;
        var msg = delta >= 0
            ? $"Score improved by {delta} points since the previous attempt."
            : $"Score changed by {delta} points — review weak topics.";

        return new ReassessmentComparisonViewDto
        {
            ImprovementDelta = new ReassessmentImprovementDto { Label = "Outcome", Message = msg },
            Attempt1Score = ToScoreSummary("Previous attempt", previous.SubmittedAtUtc, previous.TotalScorePercent),
            ReassessmentScore = ToScoreSummary("Latest attempt", latest.SubmittedAtUtc, latest.TotalScorePercent),
            TopicComparisons = comparisons,
            TopicBreakdown = breakdown,
            Observation = new ReassessmentObservationDto
            {
                Label = "Observation",
                Text = orderedDesc.Count < 2
                    ? "Only one attempt on record; comparison uses the same attempt for both columns until you retake."
                    : "Compare your latest attempt with the prior one."
            },
            CertificateAction = new ReadinessCertificateActionDto
            {
                Title = "Readiness certificate",
                Subtitle = "Unlock when you sustain a passing score.",
                ButtonLabel = "Request certificate"
            }
        };
    }

    public async Task<RiskTrendsSummaryViewDto> GetRiskTrendsAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        var attempts = await GetUnifiedAttemptsAscendingAsync(userId, cancellationToken);

        var (topics, _, _) = await LoadTopicScoresAsync(userId, null, cancellationToken);
        var weakFreq = topics
            .Where(t => t.Percent < 80)
            .Take(8)
            .Select(t => new WeakTopicFrequencyItemDto
            {
                TopicName = t.Name,
                Frequency = Math.Clamp(100 - t.Percent, 0, 100),
                MaxFrequency = 100
            })
            .ToList();

        var points = attempts
            .GroupBy(a => a.SubmittedAtUtc.ToString("yyyy-MM"))
            .Select(g =>
            {
                var dt = DateTime.ParseExact(g.Key + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var monthLabel = dt.ToString("MMM", CultureInfo.InvariantCulture).ToUpperInvariant();
                return new RiskProgressionPointDto
                {
                    Month = monthLabel,
                    Value = (int)Math.Round(g.Average(x => x.TotalScorePercent))
                };
            })
            .ToList();

        if (points.Count == 0)
        {
            var now = DateTime.UtcNow.ToString("MMM", CultureInfo.InvariantCulture).ToUpperInvariant();
            points.Add(new RiskProgressionPointDto { Month = now, Value = 0 });
        }

        var last = attempts.LastOrDefault()?.TotalScorePercent ?? 0;
        var highRisk = last < 40 ? 1 : 0;
        var moderate = last is >= 40 and < 60 ? 1 : 0;
        var low = last >= 60 ? 1 : 0;

        return new RiskTrendsSummaryViewDto
        {
            SummaryMetrics = new[]
            {
                new RiskSummaryMetricDto
                {
                    Id = "m1",
                    Variant = "readiness",
                    Title = "Latest score",
                    Value = $"{last}%",
                    Accent = "primary",
                    HelperText = "From most recent attempt"
                },
                new RiskSummaryMetricDto
                {
                    Id = "m2",
                    Variant = "high-risk",
                    Title = "Attempts tracked",
                    Value = attempts.Count.ToString(),
                    Accent = "secondary",
                    HelperText = "Quiz submissions"
                }
            },
            RiskDistribution = new RiskDistributionDto
            {
                Total = Math.Max(1, highRisk + moderate + low),
                Segments = new[]
                {
                    new RiskDistributionSegmentDto { Key = "high", Label = "High risk", Percent = highRisk * 100, Count = highRisk, ColorClass = "red" },
                    new RiskDistributionSegmentDto { Key = "medium", Label = "Moderate", Percent = moderate * 100, Count = moderate, ColorClass = "amber" },
                    new RiskDistributionSegmentDto { Key = "low", Label = "Low risk", Percent = low * 100, Count = low, ColorClass = "emerald" }
                }
            },
            WeakTopicFrequency = new WeakTopicFrequencyDto
            {
                Items = weakFreq,
                SelectedPeriod = "month"
            },
            Insight = new RiskInsightDto
            {
                Title = "Trend",
                Text = attempts.Count >= 2
                    ? "Your scores are tracked over time as you submit attempts."
                    : "Add more attempts to see progression.",
                Icon = "trending_up"
            },
            RiskProgression = new RiskProgressionBlockDto
            {
                Title = "Score progression",
                Subtitle = "Average score by month (your attempts)",
                CurrentCohortPoints = points,
                PreviousCohortPoints = new List<RiskProgressionPointDto>(),
                PeakMarker = new PeakReadinessMarkerDto
                {
                    Label = "Latest average",
                    Value = $"{last}%",
                    Detail = "Most recent month bucket",
                    MonthKey = points.Count > 0 ? points[^1].Month : "—"
                }
            }
        };
    }

    private static ReassessmentScoreSummaryDto ToScoreSummary(string label, DateTime at, int score)
    {
        var badge = score < 40 ? "High Risk" : score < 60 ? "Moderate Risk" : "Low Risk";
        return new ReassessmentScoreSummaryDto
        {
            Label = label,
            Title = "Quiz attempt",
            SessionDate = at.ToString("yyyy-MM-dd"),
            RiskBadge = badge,
            ScorePercent = score,
            IsHighRisk = score < 40
        };
    }

    private static List<ProjectionBarDto> BuildProjectionBars(int totalScore)
    {
        var h = Math.Clamp(totalScore, 10, 95);
        return new List<ProjectionBarDto>
        {
            new() { Label = "Now", HeightPercent = h, Variant = "historical" },
            new() { Label = "+2w", HeightPercent = Math.Min(95, h + 10), Variant = "historical" },
            new() { Label = "Target", HeightPercent = Math.Min(95, h + 20), Variant = "projection" }
        };
    }

    private async Task<IReadOnlyList<UnifiedAttempt>> GetUnifiedAttemptsAscendingAsync(Guid userId,
        CancellationToken cancellationToken)
    {
        var merged = new List<UnifiedAttempt>();

        var quizAttempts = await _context.QuizAttempts
            .AsNoTracking()
            .Include(a => a.LegacyQuiz)
            .Where(a => a.UserId == userId)
            .ToListAsync(cancellationToken);

        foreach (var a in quizAttempts)
        {
            merged.Add(new UnifiedAttempt(
                a.SubmittedAtUtc,
                a.TotalScorePercent,
                ParseTopics(a.TopicScoresJson),
                a.LegacyQuiz.ModuleCode));
        }

        var sp = await _context.StudentProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (sp != null)
        {
            var submissions = await _context.Submissions
                .AsNoTracking()
                .Include(s => s.Quiz).ThenInclude(q => q.Module)
                .Include(s => s.Quiz).ThenInclude(q => q.QuizQuestions)
                .Include(s => s.Answers).ThenInclude(a => a.Question).ThenInclude(q => q.Topic)
                .Where(s => s.StudentId == sp.StudentId)
                .Where(s => s.Status == "Submitted" || s.Status == "Graded")
                .ToListAsync(cancellationToken);

            foreach (var s in submissions)
            {
                var at = s.SubmittedAt ?? s.CreatedAt;
                var utc = at.Kind == DateTimeKind.Utc ? at : DateTime.SpecifyKind(at, DateTimeKind.Utc);
                var scorePct = (int)Math.Round(s.Percentage);
                var topics = BuildTopicScoresFromSubmission(s);
                var moduleLabel = s.Quiz.Module.ModuleCode;
                merged.Add(new UnifiedAttempt(utc, scorePct, topics, moduleLabel));
            }
        }

        return merged.OrderBy(a => a.SubmittedAtUtc).ToList();
    }

    private static IReadOnlyList<QuizTopicScoreDto> BuildTopicScoresFromSubmission(Submission s)
    {
        var dict = s.Quiz.QuizQuestions.GroupBy(qq => qq.QuestionId).ToDictionary(g => g.Key, g => g.First().Marks);
        var byTopic = new Dictionary<string, (int earned, int possible)>(StringComparer.OrdinalIgnoreCase);
        foreach (var ans in s.Answers)
        {
            var topic = ans.Question.Topic?.TopicName?.Trim();
            if (string.IsNullOrWhiteSpace(topic))
                topic = "General";

            var possible = dict.TryGetValue(ans.QuestionId, out var m) ? m : ans.Question.Marks;
            if (!byTopic.TryGetValue(topic, out var tup))
                byTopic[topic] = (0, 0);

            byTopic[topic] = (tup.earned + ans.Marks, tup.possible + possible);
        }

        if (byTopic.Count == 0 && s.TotalMarks > 0)
        {
            var label = s.Quiz.Module?.ModuleCode ?? "Quiz";
            return new List<QuizTopicScoreDto>
            {
                new()
                {
                    TopicName = label,
                    Percent = Math.Clamp((int)Math.Round(s.Percentage), 0, 100)
                }
            };
        }

        return byTopic
            .Select(kv => new QuizTopicScoreDto
            {
                TopicName = kv.Key,
                Percent = kv.Value.possible > 0
                    ? Math.Clamp((int)Math.Round(100.0 * kv.Value.earned / kv.Value.possible), 0, 100)
                    : 0
            })
            .ToList();
    }

    private async Task<(List<(string Name, int Percent)> topics, string moduleLabel, int totalScore)> LoadTopicScoresAsync(
        Guid userId, string? moduleCode, CancellationToken cancellationToken)
    {
        var unified = await GetUnifiedAttemptsAscendingAsync(userId, cancellationToken);
        UnifiedAttempt? pick = null;
        if (!string.IsNullOrWhiteSpace(moduleCode))
        {
            var code = moduleCode.Trim();
            pick = unified.LastOrDefault(a =>
                string.Equals(a.ModuleLabel, code, StringComparison.OrdinalIgnoreCase));
        }

        pick ??= unified.LastOrDefault();
        if (pick != null)
        {
            return (pick.Topics.Select(t => (t.TopicName, t.Percent)).ToList(), pick.ModuleLabel, pick.TotalScorePercent);
        }

        var sp = await _context.StudentProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (sp == null)
            return (new List<(string, int)>(), "Module", 0);

        var readiness = await _context.ReadinessResults
            .AsNoTracking()
            .Where(r => r.StudentId == sp.StudentId)
            .OrderByDescending(r => r.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (readiness == null)
            return (new List<(string, int)>(), "Module", 0);

        var rt = ParseTopics(readiness.TopicPerformanceJson);
        return (rt.Select(t => (t.TopicName, t.Percent)).ToList(), readiness.ModuleCode, readiness.TotalScorePercent);
    }

    private static bool TopicMatchesRule(RecommendationRule rule, string topicName) =>
        rule.TopicName.Equals(topicName, StringComparison.OrdinalIgnoreCase)
        || topicName.Contains(rule.TopicName, StringComparison.OrdinalIgnoreCase)
        || rule.TopicName.Contains(topicName, StringComparison.OrdinalIgnoreCase);

    private static bool ScoreMatchesRule(RecommendationRule rule, int percent)
    {
        return rule.ConditionType switch
        {
            RecommendationConditionType.ScoreUnderThreshold => percent < rule.ScoreThreshold,
            RecommendationConditionType.ScoreOverThreshold => percent > rule.ScoreThreshold,
            _ => false
        };
    }

    private static RecommendationResourceInfoDto MapResourceInfo(string resourceType)
    {
        var t = resourceType.ToLowerInvariant();
        if (t.Contains("video"))
            return new RecommendationResourceInfoDto { Icon = "video_library", Label = resourceType };
        if (t.Contains("quiz"))
            return new RecommendationResourceInfoDto { Icon = "quiz", Label = resourceType };
        return new RecommendationResourceInfoDto { Icon = "article", Label = resourceType };
    }

    private static string ToWeaknessLevel(int percent) => percent switch
    {
        < 40 => "critical",
        < 60 => "moderate",
        < 75 => "minor",
        _ => "none"
    };

    private static string ToMatrixStatus(string weakness) => weakness switch
    {
        "critical" => "immediate_action",
        "moderate" => "scheduled_review",
        "minor" => "self_study",
        _ => "meeting_target"
    };

    private static List<QuizTopicScoreDto> ParseTopics(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new List<QuizTopicScoreDto>();

        try
        {
            var rows = JsonSerializer.Deserialize<List<TopicRow>>(json, TopicJsonOptions);
            if (rows == null)
                return new List<QuizTopicScoreDto>();

            return rows
                .Where(r => !string.IsNullOrWhiteSpace(r.TopicName))
                .Select(r => new QuizTopicScoreDto
                {
                    TopicName = r.TopicName!.Trim(),
                    Percent = Math.Clamp(r.Percent, 0, 100)
                })
                .ToList();
        }
        catch (JsonException)
        {
            return new List<QuizTopicScoreDto>();
        }
    }

    private sealed class TopicRow
    {
        public string? TopicName { get; set; }
        public int Percent { get; set; }
    }
}
