import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Question, QuestionFilter } from '../models/readiness/question.model';
import { Quiz, QuizSchedule } from '../models/readiness/quiz.model';
import {
  Submission,
  AttemptSummary,
  SubmissionStats,
  AttemptStats,
} from '../models/readiness/submission.model';
import { Resource } from '../models/readiness/resource.model';
import { API_BASE_URL } from '../config/api.config';

// API response wrapper - matches the backend ApiResponseDto
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

// module info from curriculum API - used for dropdowns
interface ModuleInfo {
  id: string;
  moduleCode: string;
  moduleName: string;
}

// topic info from curriculum API
interface TopicInfo {
  id: string;
  topicName: string;
  moduleId: string;
}

// ============================================
// READINESS SERVICE
// connects to real .NET backend API
// ============================================

@Injectable({
  providedIn: 'root',
})
export class ReadinessService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${API_BASE_URL}/api`;

  // ---------- QUESTION METHODS ----------

  // get all questions with optional filters
  getQuestions(filter?: QuestionFilter): Observable<Question[]> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.module) params = params.set('module', filter.module);
    if (filter?.topic) params = params.set('topic', filter.topic);
    if (filter?.difficulty) params = params.set('difficulty', filter.difficulty);
    if (filter?.status) params = params.set('status', filter.status);

    return this.http
      .get<ApiResponse<Question[]>>(`${this.apiUrl}/questions`, { params })
      .pipe(map((res) => res.data));
  }

  // get a single question by id
  getQuestionById(id: string): Observable<Question | undefined> {
    return this.http
      .get<ApiResponse<Question>>(`${this.apiUrl}/questions/${id}`)
      .pipe(map((res) => res.data));
  }

  // create a new question - moduleId must be a GUID from getModuleList()
  createQuestion(question: Partial<Question> & { moduleId?: string; topicId?: string }): Observable<Question> {
    const body = {
      title: question.title,
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty,
      moduleId: question.moduleId || '', // GUID from modules API
      topicId: question.topicId || null,
      explanation: question.explanation,
      marks: question.marks,
      status: question.status,
      options: question.options?.map((o) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })) || [],
      correctOptionIndex: question.options?.findIndex((o) => o.isCorrect) ?? 0,
    };

    return this.http
      .post<ApiResponse<Question>>(`${this.apiUrl}/questions`, body)
      .pipe(map((res) => res.data));
  }

  // update a question
  updateQuestion(id: string, updates: Partial<Question> & { topicId?: string | null }): Observable<Question> {
    const body = {
      title: updates.title,
      questionText: updates.questionText,
      questionType: updates.questionType,
      difficulty: updates.difficulty,
      topicId: updates.topicId || null, // pass actual topic ID
      explanation: updates.explanation,
      marks: updates.marks,
      status: updates.status,
      options: updates.options?.map((o) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })) || [],
      correctOptionIndex: updates.options?.findIndex((o) => o.isCorrect) ?? 0,
    };

    return this.http
      .put<ApiResponse<Question>>(`${this.apiUrl}/questions/${id}`, body)
      .pipe(map((res) => res.data));
  }

  // delete a question
  deleteQuestion(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/questions/${id}`)
      .pipe(map((res) => res.data));
  }

  // get modules from curriculum API for dropdowns (returns real data from backend)
  getModuleList(): Observable<ModuleInfo[]> {
    return this.http
      .get<ApiResponse<ModuleInfo[]>>(`${this.apiUrl}/modules`)
      .pipe(map((res) => res.data));
  }

  // get topics from curriculum API for dropdowns
  getTopicList(moduleId?: string): Observable<TopicInfo[]> {
    let params = new HttpParams();
    if (moduleId) params = params.set('moduleId', moduleId);

    return this.http
      .get<ApiResponse<TopicInfo[]>>(`${this.apiUrl}/topics`, { params })
      .pipe(map((res) => res.data));
  }

  // static module name list for simple dropdowns (backwards compatible)
  getModules(): string[] {
    return [
      'Data Structures & Algorithms',
      'Object Oriented Programming',
      'Web Application Development',
      'Database Management Systems',
      'Software Engineering',
    ];
  }

  // static topic name list for simple dropdowns (backwards compatible)
  getTopics(): string[] {
    return [
      'Asymptotic Analysis',
      'Linear Data Structures',
      'Trees & Binary Trees',
      'Graph Algorithms',
      'Sorting Algorithms',
      'Recursion',
      'Hashing',
      'OOP Fundamentals',
      'Inheritance & Polymorphism',
      'Database Design',
      'Database Queries',
    ];
  }

  // ---------- QUIZ METHODS ----------

  // get all quizzes
  getQuizzes(): Observable<Quiz[]> {
    return this.http
      .get<ApiResponse<Quiz[]>>(`${this.apiUrl}/quizzes`)
      .pipe(map((res) => res.data));
  }

  // get a single quiz by id
  getQuizById(id: string): Observable<Quiz | undefined> {
    return this.http
      .get<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes/${id}`)
      .pipe(map((res) => res.data));
  }

  // get questions for a specific quiz (for the quiz attempt page)
  // note: backend hides correct answers so students can't cheat
  getQuizQuestions(quizId: string): Observable<Question[]> {
    return this.http
      .get<ApiResponse<Question[]>>(`${this.apiUrl}/quizzes/${quizId}/questions`)
      .pipe(map((res) => res.data));
  }

  // create a new quiz
  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http
      .post<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes`, quiz)
      .pipe(map((res) => res.data));
  }

  // ---------- SCHEDULE METHODS ----------

  // get all quiz schedules
  getSchedules(): Observable<QuizSchedule[]> {
    return this.http
      .get<ApiResponse<QuizSchedule[]>>(`${this.apiUrl}/quiz-schedules`)
      .pipe(map((res) => res.data));
  }

  // create a new schedule
  createSchedule(schedule: Partial<QuizSchedule>): Observable<QuizSchedule> {
    return this.http
      .post<ApiResponse<QuizSchedule>>(`${this.apiUrl}/quiz-schedules`, schedule)
      .pipe(map((res) => res.data));
  }

  // update a schedule
  updateSchedule(id: string, updates: Partial<QuizSchedule>): Observable<QuizSchedule> {
    return this.http
      .put<ApiResponse<QuizSchedule>>(`${this.apiUrl}/quiz-schedules/${id}`, updates)
      .pipe(map((res) => res.data));
  }

  // ---------- SUBMISSION METHODS ----------

  // get all submissions, optionally filtered by quiz
  getSubmissions(quizId?: string): Observable<Submission[]> {
    let params = new HttpParams();
    if (quizId) params = params.set('quizId', quizId);

    return this.http
      .get<ApiResponse<Submission[]>>(`${this.apiUrl}/submissions`, { params })
      .pipe(map((res) => res.data));
  }

  // get submission statistics
  getSubmissionStats(quizId?: string): Observable<SubmissionStats> {
    let params = new HttpParams();
    if (quizId) params = params.set('quizId', quizId);

    return this.http
      .get<ApiResponse<SubmissionStats>>(`${this.apiUrl}/submissions/stats`, { params })
      .pipe(map((res) => res.data));
  }

  // submit a quiz (student answers) - backend auto-calculates score
  // TODO: replace hardcoded student info with auth service when login is integrated
  submitQuiz(
    quizId: string,
    answers: { questionId: string; selectedOptionId: string }[]
  ): Observable<Submission> {
    const body = {
      quizId,
      studentId: 'IT23201996', // hardcoded for now - will come from auth later
      studentName: 'Test Student',
      studentAvatar: 'TS',
      avatarColor: 'bg-primary-fixed',
      answers: answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId || null,
      })),
    };

    return this.http
      .post<ApiResponse<Submission>>(`${this.apiUrl}/submissions`, body)
      .pipe(map((res) => res.data));
  }

  // ---------- ATTEMPT HISTORY METHODS ----------

  // get attempt history (all past attempts)
  getAttemptHistory(): Observable<AttemptSummary[]> {
    return this.http
      .get<ApiResponse<AttemptSummary[]>>(`${this.apiUrl}/submissions/history`)
      .pipe(map((res) => res.data));
  }

  // get attempt history statistics
  getAttemptStats(): Observable<AttemptStats> {
    return this.http
      .get<ApiResponse<AttemptStats>>(`${this.apiUrl}/submissions/history/stats`)
      .pipe(map((res) => res.data));
  }

  // ---------- RESOURCE METHODS ----------

  // get all learning resources
  getResources(): Observable<Resource[]> {
    return this.http
      .get<ApiResponse<Resource[]>>(`${this.apiUrl}/resources`)
      .pipe(map((res) => res.data));
  }
}
