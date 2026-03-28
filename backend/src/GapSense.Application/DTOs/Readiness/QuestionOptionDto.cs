namespace GapSense.Application.DTOs.Readiness;

// option data sent back to the frontend
public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}
