using GapSense.Domain.Entities;
using GapSense.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence;

/// <summary>
/// Seeds academic structure (semesters, modules), demo students, and readiness trend points for the dashboard.
/// </summary>
public static class MonitoringDbSeeder
{
    private static readonly Guid Semester2024S1Id = Guid.Parse("a1000000-0000-4000-8000-000000000001");
    private static readonly Guid Semester2024S2Id = Guid.Parse("a1000000-0000-4000-8000-000000000002");
    private static readonly Guid Semester2025S1Id = Guid.Parse("a1000000-0000-4000-8000-000000000003");

    public static async Task SeedAsync(GapSenseDbContext db, CancellationToken ct = default)
    {
        await EnsureSemestersAndModulesAsync(db, ct);
        await EnsureStudentProfilesAsync(db, ct);
        await EnsureFollowUpTasksAsync(db, ct);
        await EnsureReadinessTrendAsync(db, ct);
        await EnsureModulesForSemestersMissingModulesAsync(db, ct);
        await EnsureInterventionPlansAsync(db, ct);
    }

    private static async Task EnsureSemestersAndModulesAsync(GapSenseDbContext db, CancellationToken ct)
    {
        var utc = DateTime.UtcNow;

        if (await db.Semesters.AnyAsync(ct))
        {
            if (!await db.AcademicModules.AnyAsync(ct))
            {
                var currentId = await db.Semesters.Where(s => s.IsCurrent).Select(s => s.Id).FirstOrDefaultAsync(ct);
                if (currentId != Guid.Empty)
                {
                    AddModuleRows(db, currentId, utc);
                    await db.SaveChangesAsync(ct);
                }
            }

            return;
        }

        var s1 = new Semester
        {
            Id = Semester2024S1Id,
            Name = "Semester 1, 2024",
            AcademicYear = "2024/2025",
            Term = 1,
            IsCurrent = false,
            StartDate = new DateOnly(2024, 8, 1),
            EndDate = new DateOnly(2025, 1, 31),
            IsActive = true,
            CreatedAt = utc,
        };
        var s2 = new Semester
        {
            Id = Semester2024S2Id,
            Name = "Semester 2, 2024",
            AcademicYear = "2024/2025",
            Term = 2,
            IsCurrent = false,
            StartDate = new DateOnly(2025, 2, 1),
            EndDate = new DateOnly(2025, 7, 31),
            IsActive = true,
            CreatedAt = utc,
        };
        var s3 = new Semester
        {
            Id = Semester2025S1Id,
            Name = "Semester 1, 2025",
            AcademicYear = "2025/2026",
            Term = 1,
            IsCurrent = true,
            StartDate = new DateOnly(2025, 8, 1),
            EndDate = new DateOnly(2026, 1, 31),
            IsActive = true,
            CreatedAt = utc,
        };

        db.Semesters.AddRange(s1, s2, s3);
        AddModuleRows(db, Semester2024S1Id, utc);
        AddModuleRows(db, Semester2024S2Id, utc);
        AddModuleRows(db, Semester2025S1Id, utc);

        await db.SaveChangesAsync(ct);
    }

    private static void AddModuleRows(GapSenseDbContext db, Guid semId, DateTime utc)
    {
        void AddMods(Guid id, params (string Code, string Name)[] mods)
        {
            foreach (var (code, name) in mods)
            {
                db.AcademicModules.Add(new AcademicModule
                {
                    ModuleCode = code,
                    ModuleName = name,
                    SemesterId = id,
                    IsActive = true,
                    CreatedAt = utc,
                });
            }
        }

        AddMods(semId,
            ("IT1010", "Programming Fundamentals"),
            ("IT1020", "Object Oriented Programming"),
            ("IT2010", "Data Structures & Algorithms"),
            ("IT2020", "Database Systems"),
            ("IT3010", "Software Architecture"),
            ("IT3020", "Web Application Development"),
            ("IT3030", "Computer Networks"),
            ("IT3040", "Cloud Architecture"));
    }

    private static async Task EnsureStudentProfilesAsync(GapSenseDbContext db, CancellationToken ct)
    {
        if (await db.StudentProfiles.AnyAsync(ct))
        {
            return;
        }

        var currentSemesterId = await db.Semesters.Where(s => s.IsCurrent).Select(s => s.Id).FirstAsync(ct);
        var utc = DateTime.UtcNow;

        var profiles = new List<StudentProfile>
        {
            P(Guid.Parse("10000000-0000-4000-8000-000000000001"), "IT21045230", "Arjun Wickremasinghe", "arjun.w@student.sliit.lk", true, "Data Structures & Algorithms", 2.4m, 58m, 34m, 42m, 88m, "declining", currentSemesterId, "2024.1", utc, [("Graph Theory", "high"), ("Binary Trees", "high")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000002"), "IT21088412", "Dinushi Perera", "dinushi.p@student.sliit.lk", false, "Software Architecture", 3.1m, 72m, 55m, 68m, 62m, "stable", currentSemesterId, "2024.1", utc, [("Microservices", "medium"), ("UML", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000003"), "IT21100256", "Kavindu Gunathilake", "kavindu.g@student.sliit.lk", false, "Cloud Architecture", 3.6m, 88m, 78m, 82m, 38m, "improving", currentSemesterId, "2024.1", utc, [("Containers", "low")], lowRisk: true),
            P(Guid.Parse("10000000-0000-4000-8000-000000000004"), "IT21077890", "Nethmi Silva", "nethmi.s@student.sliit.lk", true, "Digital Electronics", 2.1m, 52m, 41m, 38m, 91m, "declining", currentSemesterId, "2024.1", utc, [("Logic Gates", "high"), ("K-Maps", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000005"), "IT21050112", "Rashmika Fernando", "rashmika.f@student.sliit.lk", false, "Database Systems", 2.9m, 65m, 48m, 58m, 71m, "stable", currentSemesterId, "2024.1", utc, [("Transactions", "high"), ("Indexing", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000006"), "IT21090345", "Malith Jayasekara", "malith.j@student.sliit.lk", true, "Computer Networks", 2.0m, 45m, 36m, 35m, 94m, "declining", currentSemesterId, "2024.1", utc, [("TCP/IP", "high"), ("Subnetting", "high")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000007"), "IT21110444", "Imesha Ranaweera", "imesha.r@student.sliit.lk", false, "Web Application Development", 3.4m, 81m, 69m, 74m, 48m, "improving", currentSemesterId, "2024.1", utc, [("Security", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000008"), "IT21033445", "Sandun Perera", "sandun.p@student.sliit.lk", false, "Data Structures & Algorithms", 3.2m, 76m, 62m, 71m, 52m, "improving", currentSemesterId, "2024.1", utc, [("Sorting", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000009"), "IT21055678", "Tharushi Mendis", "tharushi.m@student.sliit.lk", false, "Object Oriented Programming", 3.5m, 90m, 85m, 88m, 35m, "stable", currentSemesterId, "2024.1", utc, [], lowRisk: true),
            P(Guid.Parse("10000000-0000-4000-8000-000000000010"), "IT21066789", "Dilhara Silva", "dilhara.s@student.sliit.lk", true, "Computer Networks", 2.3m, 48m, 31m, 28m, 89m, "declining", currentSemesterId, "2024.1", utc, [("Routing", "high")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000011"), "IT21077801", "Pasan Liyanage", "pasan.l@student.sliit.lk", false, "Programming Fundamentals", 3.0m, 70m, 58m, 64m, 58m, "stable", currentSemesterId, "2024.1", utc, [("Loops", "low")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000012"), "IT21088912", "Hansi Karunaratne", "hansi.k@student.sliit.lk", false, "Database Systems", 3.7m, 92m, 80m, 86m, 32m, "improving", currentSemesterId, "2025.1", utc, [], lowRisk: true),
            P(Guid.Parse("10000000-0000-4000-8000-000000000013"), "IT21099023", "Ravindu Ekanayake", "ravindu.e@student.sliit.lk", true, "Software Architecture", 2.2m, 55m, 44m, 40m, 85m, "declining", currentSemesterId, "2025.1", utc, [("Design patterns", "high")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000014"), "IT21100134", "Anuki Fernando", "anuki.f@student.sliit.lk", false, "Web Application Development", 3.3m, 79m, 66m, 72m, 50m, "improving", currentSemesterId, "2025.1", utc, [("React", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000015"), "IT21111245", "Buddhika Rathnayake", "buddhika.r@student.sliit.lk", false, "Cloud Architecture", 3.4m, 84m, 72m, 78m, 45m, "stable", currentSemesterId, "2025.1", utc, [("Kubernetes", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000016"), "IT21122356", "Chamodi Wijesinghe", "chamodi.w@student.sliit.lk", false, "Programming Fundamentals", 2.8m, 63m, 52m, 56m, 68m, "stable", currentSemesterId, "2025.1", utc, [("Arrays", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000017"), "IT21133467", "Dumindu Jayasundara", "dumindu.j@student.sliit.lk", true, "Data Structures & Algorithms", 2.0m, 42m, 28m, 30m, 93m, "declining", currentSemesterId, "2025.1", utc, [("Heaps", "high")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000018"), "IT21144578", "Eranga Perera", "eranga.p@student.sliit.lk", false, "Object Oriented Programming", 3.6m, 87m, 76m, 81m, 40m, "improving", currentSemesterId, "2025.1", utc, [], lowRisk: true),
            P(Guid.Parse("10000000-0000-4000-8000-000000000019"), "IT21155689", "Fathima Rizwan", "fathima.r@student.sliit.lk", false, "Digital Electronics", 3.1m, 74m, 61m, 66m, 55m, "stable", currentSemesterId, "2025.1", utc, [("Sequential logic", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000020"), "IT21166790", "Gayan Bandara", "gayan.b@student.sliit.lk", false, "Database Systems", 3.8m, 91m, 82m, 87m, 30m, "stable", currentSemesterId, "2025.1", utc, [], lowRisk: true),
            P(Guid.Parse("10000000-0000-4000-8000-000000000021"), "IT21177801", "Hiruni Senanayake", "hiruni.s@student.sliit.lk", false, "Computer Networks", 2.7m, 61m, 49m, 54m, 65m, "stable", currentSemesterId, "2025.1", utc, [("DNS", "medium")]),
            P(Guid.Parse("10000000-0000-4000-8000-000000000022"), "IT21188912", "Isuru Dissanayake", "isuru.d@student.sliit.lk", true, "Software Architecture", 2.4m, 50m, 38m, 36m, 90m, "declining", currentSemesterId, "2025.1", utc, [("SOLID", "high")]),
        };

        db.StudentProfiles.AddRange(profiles);
        await db.SaveChangesAsync(ct);

        foreach (var profile in profiles)
        {
            await AddDefaultMonitoringArtifactsAsync(db, profile, utc, profile.RiskLevel == "critical", ct);
        }

        await db.SaveChangesAsync(ct);
    }

    private static StudentProfile P(
        Guid id,
        string studentId,
        string fullName,
        string email,
        bool critical,
        string module,
        decimal gpa,
        decimal attendance,
        decimal recentScore,
        decimal readiness,
        decimal riskScore,
        string trend,
        Guid semesterId,
        string batch,
        DateTime utc,
        (string Topic, string Severity)[] weak,
        bool lowRisk = false)
    {
        var riskLevel = lowRisk ? "low" : critical ? "critical" : "moderate";
        var profile = new StudentProfile
        {
            Id = id,
            StudentId = studentId,
            FullName = fullName,
            Email = email,
            Phone = "+94771234567",
            Batch = batch,
            Year = 3,
            SemesterId = semesterId,
            DegreeProgram = "BSc (Hons) Information Technology",
            Gpa = gpa,
            AttendancePercentage = attendance,
            RecentAssessmentScore = recentScore,
            ReadinessScore = readiness,
            RiskScore = riskScore,
            RiskLevel = riskLevel,
            PerformanceTrend = trend,
            CurrentModule = module,
            IsActive = true,
            CreatedAt = utc.AddDays(-14),
        };
        foreach (var (topic, sev) in weak)
        {
            profile.WeakTopics.Add(new WeakTopicAnalysis
            {
                TopicName = topic,
                Severity = sev,
                Notes = $"Identified via readiness analytics — {topic}.",
                IsActive = true,
                CreatedAt = utc.AddDays(-10),
            });
        }

        return profile;
    }

    private static async Task AddDefaultMonitoringArtifactsAsync(
        GapSenseDbContext db,
        StudentProfile profile,
        DateTime utc,
        bool critical,
        CancellationToken ct)
    {
        profile.InterventionAssignments.Add(new InterventionAssignment
        {
            AssignedToName = "Dr. Saman Perera",
            AssignedToRole = "Senior Lecturer",
            InterventionType = "remedial",
            Priority = critical ? "high" : "medium",
            Note = "Initial academic support plan.",
            DueDate = utc.AddDays(7),
            FollowUpDate = utc.AddDays(14),
            Status = "active",
            IsActive = true,
            CreatedAt = utc.AddDays(-5),
        });

        profile.MonitoringNotes.Add(new MonitoringNote
        {
            NoteType = "general",
            NoteText = "Student briefed on available lab support sessions.",
            AddedBy = "Course Coordinator",
            IsActive = true,
            CreatedAt = utc.AddDays(-3),
        });

        profile.Meetings.Add(new MeetingOrFollowUp
        {
            Title = "1:1 academic check-in",
            Description = "Discuss progress and revision plan.",
            ScheduledDate = utc.AddDays(3),
            MeetingType = "follow-up",
            Status = "scheduled",
            CreatedBy = "Lecturer",
            IsActive = true,
            CreatedAt = utc.AddDays(-2),
        });

        profile.Referrals.Add(new ReferralOrEscalation
        {
            ReferralType = critical ? "academic" : "counselor",
            ReferredTo = critical ? "Head of Department" : "Student Counselling Unit",
            Reason = critical
                ? "Persistent low readiness across formative assessments."
                : "Routine wellness check-in requested.",
            Status = "pending",
            CreatedBy = "Lecturer",
            IsActive = true,
            CreatedAt = utc.AddDays(-1),
        });

        await Task.CompletedTask;
    }

    private static async Task EnsureFollowUpTasksAsync(GapSenseDbContext db, CancellationToken ct)
    {
        if (await db.FollowUpTasks.AnyAsync(ct))
        {
            return;
        }

        var utc = DateTime.UtcNow;
        var currentSemesterId = await db.Semesters.Where(s => s.IsCurrent).Select(s => s.Id).FirstOrDefaultAsync(ct);
        if (currentSemesterId == Guid.Empty)
        {
            return;
        }

        var students = await db.StudentProfiles
            .AsNoTracking()
            .Where(s => s.SemesterId == currentSemesterId && s.IsActive)
            .OrderByDescending(s => s.RiskScore)
            .Take(6)
            .Select(s => s.Id)
            .ToListAsync(ct);

        if (students.Count == 0)
        {
            return;
        }

        void Add(Guid studentId, string title, string? description, int dueDays, FollowUpPriority priority, string assignedTo)
        {
            db.FollowUpTasks.Add(new FollowUpTask
            {
                StudentProfileId = studentId,
                Title = title,
                Description = description,
                DueDate = utc.Date.AddDays(dueDays),
                Status = FollowUpStatus.Pending,
                Priority = priority,
                AssignedTo = assignedTo,
                IsDismissed = false,
                IsActive = true,
                CreatedAt = utc.AddHours(-2),
            });
        }

        Add(students[0], "High-risk student review pending", "Holistic readiness review and intervention plan sign-off.", 0, FollowUpPriority.High, "Academic Coordinator");
        if (students.Count > 1)
        {
            Add(students[1], "Intervention follow-up due today", "Check progress on remedial plan and attendance.", 0, FollowUpPriority.Critical, "Senior Lecturer");
        }

        if (students.Count > 2)
        {
            Add(students[2], "Counselor referral review pending", "Wellness referral documentation and consent follow-up.", 2, FollowUpPriority.Medium, "Student Counselling Unit");
        }

        if (students.Count > 3)
        {
            Add(students[3], "Assignment not reviewed", "Mid-term submission requires lecturer feedback.", -1, FollowUpPriority.Medium, "Module Lecturer");
        }

        if (students.Count > 4)
        {
            Add(students[4], "Lecturer review not completed", "Peer observation action items from last review cycle.", 1, FollowUpPriority.Low, "Head of Department");
        }

        if (students.Count > 5)
        {
            Add(students[5], "Overdue follow-up item", "Escalation: no contact logged within SLA window.", -3, FollowUpPriority.High, "Monitoring Team");
        }

        await db.SaveChangesAsync(ct);
    }

    private static async Task EnsureReadinessTrendAsync(GapSenseDbContext db, CancellationToken ct)
    {
        var currentId = await db.Semesters.Where(s => s.IsCurrent).Select(s => s.Id).FirstOrDefaultAsync(ct);
        if (currentId == Guid.Empty)
        {
            return;
        }

        if (await db.ReadinessResults.AnyAsync(r => r.SemesterId == currentId, ct))
        {
            return;
        }

        var sem = await db.Semesters.AsNoTracking().FirstAsync(s => s.Id == currentId, ct);
        var cy = DateTime.UtcNow.Year;
        var py = cy - 1;

        // Chart-ready monthly aggregates: multiple samples per month/year
        var trendPoints = new (int Year, int Month, decimal Score)[]
        {
            (py, 1, 52), (py, 2, 54), (py, 3, 56), (py, 4, 58), (py, 5, 60), (py, 6, 59), (py, 7, 61),
            (cy, 1, 58), (cy, 2, 60), (cy, 3, 62), (cy, 4, 64), (cy, 5, 66), (cy, 6, 65), (cy, 7, 68),
        };

        var n = 0;
        foreach (var (year, month, baseScore) in trendPoints)
        {
            for (var k = 0; k < 6; k++)
            {
                var score = Math.Clamp(baseScore + (decimal)(k - 3) * 1.2m, 0, 100);
                db.ReadinessResults.Add(new ReadinessResult
                {
                    StudentId = $"TREND{n % 50:D4}",
                    ModuleCode = "IT2010",
                    Batch = "2024.1",
                    Semester = sem.Name,
                    SemesterId = currentId,
                    ReadinessScore = score,
                    Status = "recorded",
                    IsActive = true,
                    CreatedAt = new DateTime(year, month, 10 + k, 12, 0, 0, DateTimeKind.Utc),
                });
                n++;
            }
        }

        await db.SaveChangesAsync(ct);
    }

    /// <summary>Ensures every semester has the standard module catalogue (for filter demos on past terms).</summary>
    private static async Task EnsureModulesForSemestersMissingModulesAsync(GapSenseDbContext db, CancellationToken ct)
    {
        if (!await db.Semesters.AnyAsync(ct))
        {
            return;
        }

        var utc = DateTime.UtcNow;
        var semIds = await db.Semesters.Select(s => s.Id).ToListAsync(ct);
        var added = false;
        foreach (var semId in semIds)
        {
            if (await db.AcademicModules.AnyAsync(m => m.SemesterId == semId, ct))
            {
                continue;
            }

            AddModuleRows(db, semId, utc);
            added = true;
        }

        if (added)
        {
            await db.SaveChangesAsync(ct);
        }
    }

    private static async Task EnsureInterventionPlansAsync(GapSenseDbContext db, CancellationToken ct)
    {
        if (await db.InterventionPlans.AnyAsync(ct))
        {
            return;
        }

        var utc = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(utc);

        var p1 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000001"),
            ModuleCode = "IT3010",
            Batch = "2024.1",
            RiskGroup = "high",
            WeakTopic = "ER modeling and normalization",
            InterventionType = "tutorial",
            PlannedDate = today.AddDays(-10),
            Status = "active",
            AssignedLecturer = null,
            Notes = "Schedule two guided labs; review ER exercises.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-12),
        };
        p1.Reviews.Add(new InterventionReview
        {
            ReviewDate = today.AddDays(-3),
            Outcome = "successful",
            ImprovementPercentage = 82,
            IsCompleted = true,
            IsActive = true,
            CreatedAt = utc.AddDays(-3),
        });

        var p2 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000002"),
            ModuleCode = "IT2010",
            Batch = "2025.1",
            RiskGroup = "high",
            WeakTopic = "Binary tree traversals",
            InterventionType = "remedial",
            PlannedDate = today.AddDays(-14),
            Status = "active",
            AssignedLecturer = null,
            Notes = "Focus on traversal exercises.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-15),
        };

        var p3 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000003"),
            ModuleCode = "IT3010",
            Batch = "2024.1",
            RiskGroup = "medium",
            WeakTopic = "SQL joins and subqueries",
            InterventionType = "workshop",
            PlannedDate = today.AddDays(-2),
            Status = "planned",
            AssignedLecturer = "Dr. Saman Perera",
            Notes = "Mandatory workshop attendance.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-4),
        };
        p3.Reviews.Add(new InterventionReview
        {
            ReviewDate = today.AddDays(-1),
            Outcome = "successful",
            ImprovementPercentage = 74.5m,
            IsCompleted = true,
            IsActive = true,
            CreatedAt = utc.AddDays(-1),
        });

        var p4 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000004"),
            ModuleCode = "IT3020",
            Batch = "2024.1",
            RiskGroup = "low",
            WeakTopic = "REST API design",
            InterventionType = "mentoring",
            PlannedDate = today.AddDays(7),
            Status = "planned",
            AssignedLecturer = "Ms. N. Fernando",
            Notes = "1:1 architecture review.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-1),
        };

        var p5 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000005"),
            ModuleCode = "IT3040",
            Batch = "2025.1",
            RiskGroup = "medium",
            WeakTopic = "Kubernetes networking",
            InterventionType = "tutorial",
            PlannedDate = today.AddDays(-20),
            Status = "active",
            AssignedLecturer = null,
            Notes = "Lab capacity check required.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-21),
        };

        var p6 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000006"),
            ModuleCode = "IT1010",
            Batch = "2024.1",
            RiskGroup = "high",
            WeakTopic = "Loop invariants",
            InterventionType = "extra-support",
            PlannedDate = today.AddDays(-30),
            Status = "completed",
            AssignedLecturer = "Dr. K. Silva",
            Notes = "Closed after exam improvement.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-40),
        };
        p6.Reviews.Add(new InterventionReview
        {
            ReviewDate = today.AddDays(-25),
            Outcome = "successful",
            ImprovementPercentage = 91,
            IsCompleted = true,
            IsActive = true,
            CreatedAt = utc.AddDays(-25),
        });
        p6.Reviews.Add(new InterventionReview
        {
            ReviewDate = today.AddDays(-10),
            Outcome = "partial",
            ImprovementPercentage = 68,
            IsCompleted = true,
            IsActive = true,
            CreatedAt = utc.AddDays(-10),
        });

        var p7 = new InterventionPlan
        {
            Id = Guid.Parse("b2000000-0000-4000-8000-000000000007"),
            ModuleCode = "IT3030",
            Batch = "2025.1",
            RiskGroup = "medium",
            WeakTopic = "Subnetting drills",
            InterventionType = "group-discussion",
            PlannedDate = today.AddDays(-8),
            Status = "planned",
            AssignedLecturer = null,
            Notes = "Peer-led review session.",
            IsDraft = false,
            IsActive = true,
            CreatedAt = utc.AddDays(-9),
        };

        db.InterventionPlans.AddRange(p1, p2, p3, p4, p5, p6, p7);
        await db.SaveChangesAsync(ct);
    }
}
