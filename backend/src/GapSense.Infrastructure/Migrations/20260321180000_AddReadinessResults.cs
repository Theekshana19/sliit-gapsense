using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReadinessResults : Migration
    {
        private static readonly Guid DemoId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        private const string DemoTopicsJson =
            """[{"topicName":"Linear Algebra Basics","percent":28},{"topicName":"Discrete Mathematics","percent":45},{"topicName":"Introduction to Programming","percent":52}]""";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReadinessResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StudentId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    SemesterLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AttemptLabel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AnalysisDateLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TotalScorePercent = table.Column<int>(type: "int", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RiskDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    WeakTopicsCount = table.Column<int>(type: "int", nullable: false),
                    WeakTopicsSeverityLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WeakTopicsHelperText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ActionPlanRecommendationCount = table.Column<int>(type: "int", nullable: false),
                    ActionPlanBadgeLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionPlanHelperText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    InterpretationMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    TopicPerformanceJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadinessResults", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ReadinessResults",
                columns: new[]
                {
                    "Id", "StudentName", "StudentId", "ModuleCode", "SemesterLabel", "AttemptLabel", "AnalysisDateLabel",
                    "TotalScorePercent", "RiskLevel", "RiskDescription", "WeakTopicsCount", "WeakTopicsSeverityLabel",
                    "WeakTopicsHelperText", "ActionPlanRecommendationCount", "ActionPlanBadgeLabel", "ActionPlanHelperText",
                    "InterpretationMessage", "TopicPerformanceJson",
                },
                values: new object[]
                {
                    DemoId,
                    "Nimna Silva",
                    "IT21004562",
                    "IT3040",
                    "Year 3, Semester 1",
                    "01",
                    "Oct 24, 2023",
                    42,
                    "high",
                    "Significant gaps detected in fundamental concepts.",
                    3,
                    "High Severity",
                    "Critical foundations missing",
                    5,
                    "Key Recommendations",
                    "Targeted learning paths",
                    "Student requires additional preparation before starting this module.",
                    DemoTopicsJson,
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ReadinessResults");
        }
    }
}
