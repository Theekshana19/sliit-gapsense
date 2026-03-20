// question related models - used in question bank, quiz builder, and quiz attempt pages

// the type of question (for now we only have MCQ and True/False)
export type QuestionType = 'MCQ' | 'TRUE_FALSE';

// difficulty levels - shown as colored badges in the UI
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

// question status - active questions are used in quizzes
export type QuestionStatus = 'Active' | 'Draft' | 'Archived';

// each MCQ option has an id, text, and whether it's the correct answer
export interface QuestionOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

// main question model - this is the core data structure for the question bank
export interface Question {
  id: string;
  questionId: string; // display ID like "QB-3040-001"
  title: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  topic: string;
  module: string;
  moduleCode: string; // like "IT2040"
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  marks: number;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
}

// filter options for the question bank page
export interface QuestionFilter {
  search?: string;
  topic?: string;
  module?: string;
  difficulty?: DifficultyLevel | '';
  status?: QuestionStatus | '';
}
