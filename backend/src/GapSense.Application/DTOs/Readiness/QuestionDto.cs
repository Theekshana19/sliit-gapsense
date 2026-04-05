namespace GapSense.Application.DTOs.Readiness;

// what we send back when the frontend requests a question
public class QuestionDto
{
    public Guid Id { get; set; }
    public string QuestionId { get; set; } = string.Empty; // display ID like "QB-IT2040-001"
    public string Title { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public List<QuestionOptionDto> Options { get; set; } = new();
    public string CorrectOptionId { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int Marks { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}
