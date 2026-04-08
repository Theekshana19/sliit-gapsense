namespace GapSense.Application.DTOs.Readiness;

// detailed submission info shown when lecturer or student clicks "View Details"
// includes the actual question text and the correct option for each answer
// this is a richer version of SubmissionDto used only for the detail view
public class SubmissionDetailDto
{
    public Guid Id { get; set; }
    public string QuizId { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
    public string QuizRef { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;

    // student info
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentAvatar { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = string.Empty;

    // attempt info
    public int AttemptNumber { get; set; }
    public int Score { get; set; }
    public int TotalMarks { get; set; }
    public decimal Percentage { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsPassed { get; set; }
    public int PassingPercentage { get; set; }

    // timing
    public string StartedAt { get; set; } = string.Empty;
    public string SubmittedAt { get; set; } = string.Empty;
    public int TimeTakenMinutes { get; set; }

    // detailed answers - shows what the student picked vs what was correct
    public List<SubmissionAnswerDetailDto> Answers { get; set; } = new();
}

// one answer with the question text and all options shown
// helps the student see what they got right or wrong
public class SubmissionAnswerDetailDto
{
    public string QuestionId { get; set; } = string.Empty;
    public string QuestionDisplayId { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public int Marks { get; set; }
    public int MarksAwarded { get; set; }
    public bool IsCorrect { get; set; }
    public string Explanation { get; set; } = string.Empty;

    // all the options for this question
    public List<SubmissionOptionDetailDto> Options { get; set; } = new();
}

// one option with flag showing if selected by student and if it was correct
public class SubmissionOptionDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public bool IsSelected { get; set; }
}
