// quiz related models - used in quiz builder, quiz scheduling, and quiz attempt pages

// quiz can be in different states
export type QuizStatus = 'Draft' | 'Published' | 'Scheduled' | 'Active' | 'Closed';

// how results are shown to students after they finish
export type ResultVisibility = 'Immediate' | 'AfterWindow' | 'Manual';

// each question in a quiz has an order and marks
export interface QuizQuestion {
  questionId: string;
  order: number;
  marks: number;
}

// main quiz model - created in quiz builder
export interface Quiz {
  id: string;
  title: string;
  description: string;
  module: string;
  moduleCode: string;
  intake: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  passingPercentage: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}

// quiz schedule - set in the quiz scheduling page
export interface QuizSchedule {
  id: string;
  quizId: string;
  quizTitle: string;
  moduleCode: string;
  startDate: string;
  endDate: string;
  maxAttempts: number;
  resultVisibility: ResultVisibility;
  status: QuizStatus;
  questionCount: number;
  questionType: string;
}
