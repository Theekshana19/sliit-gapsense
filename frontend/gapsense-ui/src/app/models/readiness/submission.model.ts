// submission related models - used in submission tracking, attempt history, and quiz attempt pages

// submission status - tracks where the student is in the quiz process
export type SubmissionStatus = 'Submitted' | 'In Progress' | 'Not Attempted' | 'Graded';

// each answer the student picks during the quiz
export interface SubmissionAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  marks: number;
}

// main submission model - one record per student per quiz attempt
export interface Submission {
  id: string;
  quizId: string;
  quizTitle: string;
  quizRef: string; // display reference like "QZ-CS3042-04"
  studentId: string;
  studentName: string;
  studentAvatar: string; // initials like "KP" for avatar display
  avatarColor: string; // background color for the avatar
  moduleCode: string;
  attemptNumber: number;
  answers: SubmissionAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  status: SubmissionStatus;
  startedAt: string;
  submittedAt: string;
  timeTakenMinutes: number;
}

// summary of a single attempt - shown in attempt history page
export interface AttemptSummary {
  id: string;
  quizId: string;
  quizTitle: string;
  quizRef: string;
  moduleCode: string;
  attemptNumber: number;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
  timeTakenMinutes: number;
  status: 'Graded' | 'Pending Review' | 'In Progress';
}

// stats shown at the top of submission tracking page
export interface SubmissionStats {
  totalCompletionRate: number;
  inProgressCount: number;
  pendingReminders: number;
  totalEnrollments: number;
}

// stats shown at the top of attempt history page
export interface AttemptStats {
  totalAttempts: number;
  avgSuccessRate: number;
  flaggedAttempts: number;
  changePercentage: number;
}
