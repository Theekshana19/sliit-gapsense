namespace GapSense.Application.DTOs.Readiness;

// one answer inside a submission
public class SubmissionAnswerDto
{
    public string QuestionId { get; set; } = string.Empty;
    public string SelectedOptionId { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Marks { get; set; }
}
