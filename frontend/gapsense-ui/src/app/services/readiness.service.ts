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
  SubmissionDetail,
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
      .pipe(map((res) => ReadinessService.normalizeQuestionList(res?.data)));
  }

  // get a single question by id
  getQuestionById(id: string): Observable<Question | undefined> {
    return this.http
      .get<ApiResponse<Question>>(`${this.apiUrl}/questions/${id}`)
      .pipe(
        map((res) => {
          const data = res?.data as unknown;
          if (!data || typeof data !== 'object') return undefined;
          const r = data as Record<string, unknown>;
          // handle PascalCase or camelCase JSON
          const normalized = {
            ...(data as Question),
            id: String(r['id'] ?? r['Id'] ?? ''),
            questionId: String(r['questionId'] ?? r['QuestionId'] ?? ''),
            moduleId: String(r['moduleId'] ?? r['ModuleId'] ?? ''),
            topicId: (r['topicId'] ?? r['TopicId'] ?? null) as string | null,
            moduleCode: String(r['moduleCode'] ?? r['ModuleCode'] ?? ''),
          } as Question;
          return normalized;
        })
      );
  }

  // create a new question - moduleId must be a GUID from getModuleList()
  createQuestion(question: Partial<Question>): Observable<Question> {
    const trimmedOptions =
      question.options
        ?.filter((o) => (o.optionText || '').trim().length > 0)
        .map((o) => ({
          optionText: o.optionText.trim(),
          isCorrect: o.isCorrect,
        })) ?? [];

    const correctOptionIndex = trimmedOptions.findIndex((o) => o.isCorrect);

    const body = {
      title: question.title,
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty,
      moduleId: question.moduleId || '', // GUID from modules API
      topicId: question.topicId || null,
      explanation: question.explanation ?? '',
      marks: question.marks,
      status: question.status,
      options: trimmedOptions,
      correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0,
    };

    return this.http
      .post<ApiResponse<Question>>(`${this.apiUrl}/questions`, body)
      .pipe(
        map((res) => {
          if (!res?.success || res.data == null) {
            throw new Error(res?.message || 'Could not create question');
          }
          return res.data;
        })
      );
  }

  // update a question
  updateQuestion(id: string, updates: Partial<Question>): Observable<Question> {
    const trimmedOptions =
      updates.options
        ?.filter((o) => (o.optionText || '').trim().length > 0)
        .map((o) => ({
          optionText: o.optionText.trim(),
          isCorrect: o.isCorrect,
        })) ?? [];

    const correctOptionIndex = trimmedOptions.findIndex((o) => o.isCorrect);

    const body = {
      title: updates.title,
      questionText: updates.questionText,
      questionType: updates.questionType,
      difficulty: updates.difficulty,
      topicId: updates.topicId || null,
      explanation: updates.explanation ?? '',
      marks: updates.marks,
      status: updates.status,
      options: trimmedOptions,
      correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0,
    };

    return this.http
      .put<ApiResponse<Question>>(`${this.apiUrl}/questions/${id}`, body)
      .pipe(
        map((res) => {
          if (!res?.success || res.data == null) {
            throw new Error(res?.message || 'Could not update question');
          }
          return res.data;
        })
      );
  }

  // delete a question
  deleteQuestion(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/questions/${id}`)
      .pipe(map((res) => res.data));
  }

  // get modules from curriculum API for dropdowns (returns real data from backend)
  getModuleList(): Observable<ModuleInfo[]> {
    return this.http.get<ApiResponse<ModuleInfo[]>>(`${this.apiUrl}/modules`).pipe(
      map((res) => ReadinessService.normalizeModuleList(res?.data))
    );
  }

  /** Ensures each question has API `id` (GUID) and display `questionId` after JSON binding. */
  private static normalizeQuestionList(data: unknown): Question[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .map((row) => {
        const r = row as Record<string, unknown>;
        const q = row as Question;
        const id = String(r['id'] ?? r['Id'] ?? q.id ?? '');
        const questionId = String(r['questionId'] ?? r['QuestionId'] ?? q.questionId ?? '');
        return { ...q, id, questionId };
      })
      .filter((q) => q.id.length > 0);
  }

  /** Ensures stable `id` strings (camelCase or PascalCase JSON) and drops invalid rows. */
  private static normalizeModuleList(data: unknown): ModuleInfo[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .map((row: Record<string, unknown>) => ({
        id: String(row['id'] ?? row['Id'] ?? ''),
        moduleCode: String(row['moduleCode'] ?? row['ModuleCode'] ?? ''),
        moduleName: String(row['moduleName'] ?? row['ModuleName'] ?? ''),
      }))
      .filter((m) => m.id.length > 0);
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
    return this.http.get<ApiResponse<Quiz[]>>(`${this.apiUrl}/quizzes`).pipe(
      map((res) => {
        if (!res?.success || res.data == null) return [];
        return res.data;
      })
    );
  }

  // get a single quiz by id
  getQuizById(id: string): Observable<Quiz | undefined> {
    return this.http.get<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes/${id}`).pipe(
      map((res) => {
        if (!res?.success) return undefined;
        return res.data ?? undefined;
      })
    );
  }

  // get questions for a specific quiz (for the quiz attempt page)
  // note: backend hides correct answers so students can't cheat
  getQuizQuestions(quizId: string): Observable<Question[]> {
    return this.http.get<ApiResponse<Question[]>>(`${this.apiUrl}/quizzes/${quizId}/questions`).pipe(
      map((res) => {
        if (!res?.success || res.data == null) return [];
        return res.data;
      })
    );
  }

  // create a new quiz — body matches CreateQuizDto (moduleId + questions required)
  createQuiz(quiz: Partial<Quiz> & { moduleId?: string }): Observable<Quiz> {
    const questions = (quiz.questions ?? [])
      .map((q, index) => {
        const row = q as Quiz['questions'][number] & { id?: string };
        const rawId = String(row.id ?? row.questionId ?? '').trim();
        const m = q.marks ?? 5;
        return {
          questionId: rawId,
          order: q.order ?? index + 1,
          marks: Math.max(1, Math.min(100, m)),
        };
      })
      .filter((x) => x.questionId.length > 0);

    const body = {
      title: (quiz.title ?? '').trim(),
      description: quiz.description ?? '',
      moduleId: quiz.moduleId ?? '',
      intake: quiz.intake ?? '',
      passingPercentage: quiz.passingPercentage ?? 40,
      timeLimitMinutes: quiz.timeLimitMinutes ?? 60,
      maxAttempts: quiz.maxAttempts ?? 1,
      shuffleQuestions: quiz.shuffleQuestions ?? false,
      shuffleOptions: quiz.shuffleOptions ?? false,
      status: quiz.status ?? 'Draft',
      questions,
    };

    return this.http.post<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes`, body).pipe(
      map((res) => {
        if (!res?.success || res.data == null) {
          throw new Error(res?.message || 'Could not create quiz');
        }
        return res.data;
      })
    );
  }

  // update an existing quiz - sends same body shape as create
  // backend will block this if the quiz already has student submissions
  updateQuiz(id: string, quiz: Partial<Quiz> & { moduleId?: string }): Observable<Quiz> {
    const questions = (quiz.questions ?? [])
      .map((q, index) => {
        const row = q as Quiz['questions'][number] & { id?: string };
        const rawId = String(row.id ?? row.questionId ?? '').trim();
        const m = q.marks ?? 5;
        return {
          questionId: rawId,
          order: q.order ?? index + 1,
          marks: Math.max(1, Math.min(100, m)),
        };
      })
      .filter((x) => x.questionId.length > 0);

    const body = {
      title: (quiz.title ?? '').trim(),
      description: quiz.description ?? '',
      moduleId: quiz.moduleId ?? '',
      intake: quiz.intake ?? '',
      passingPercentage: quiz.passingPercentage ?? 40,
      timeLimitMinutes: quiz.timeLimitMinutes ?? 60,
      maxAttempts: quiz.maxAttempts ?? 1,
      shuffleQuestions: quiz.shuffleQuestions ?? false,
      shuffleOptions: quiz.shuffleOptions ?? false,
      status: quiz.status ?? 'Draft',
      questions,
    };

    return this.http.put<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes/${id}`, body).pipe(
      map((res) => {
        if (!res?.success || res.data == null) {
          throw new Error(res?.message || 'Could not update quiz');
        }
        return res.data;
      })
    );
  }

  // delete a quiz
  deleteQuiz(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/quizzes/${id}`)
      .pipe(map((res) => res.data));
  }

  // ---------- SCHEDULE METHODS ----------

  // get all quiz schedules (students receive only open-window schedules from the API)
  getSchedules(): Observable<QuizSchedule[]> {
    return this.http.get<ApiResponse<QuizSchedule[]>>(`${this.apiUrl}/quiz-schedules`).pipe(
      map((res) => {
        if (!res?.success || res.data == null) return [];
        return res.data;
      })
    );
  }

  // create a new schedule — body matches CreateQuizScheduleDto
  createSchedule(schedule: {
    quizId: string;
    startDate: string;
    endDate: string;
    maxAttempts: number;
    resultVisibility: string;
    status: string;
  }): Observable<QuizSchedule> {
    return this.http
      .post<ApiResponse<QuizSchedule>>(`${this.apiUrl}/quiz-schedules`, schedule)
      .pipe(
        map((res) => {
          if (!res?.success || res.data == null) {
            throw new Error(res?.message || 'Could not create schedule');
          }
          return res.data;
        })
      );
  }

  // update a schedule
  updateSchedule(id: string, updates: Partial<QuizSchedule>): Observable<QuizSchedule> {
    return this.http
      .put<ApiResponse<QuizSchedule>>(`${this.apiUrl}/quiz-schedules/${id}`, updates)
      .pipe(map((res) => res.data));
  }

  // delete a schedule
  deleteSchedule(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/quiz-schedules/${id}`)
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

  // get a single submission with full details (questions, answers, correct options)
  // backend filters by user role - students can only see their own submissions
  getSubmissionDetail(id: string): Observable<SubmissionDetail | undefined> {
    return this.http
      .get<ApiResponse<SubmissionDetail>>(`${this.apiUrl}/submissions/${id}`)
      .pipe(
        map((res) => {
          if (!res?.success) return undefined;
          return res.data ?? undefined;
        })
      );
  }

  // get submission statistics
  getSubmissionStats(quizId?: string): Observable<SubmissionStats> {
    let params = new HttpParams();
    if (quizId) params = params.set('quizId', quizId);

    return this.http
      .get<ApiResponse<SubmissionStats>>(`${this.apiUrl}/submissions/stats`, { params })
      .pipe(map((res) => res.data));
  }

  // submit a quiz (student answers) — identity must match profile StudentId for attempt history
  submitQuiz(
    quizId: string,
    answers: { questionId: string; selectedOptionId: string }[],
    identity: { studentId: string; studentName: string; studentAvatar: string; avatarColor: string }
  ): Observable<Submission> {
    const body = {
      quizId,
      studentId: identity.studentId,
      studentName: identity.studentName,
      studentAvatar: identity.studentAvatar,
      avatarColor: identity.avatarColor,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId || null,
      })),
    };

    return this.http.post<ApiResponse<Submission>>(`${this.apiUrl}/submissions`, body).pipe(
      map((res) => {
        if (!res?.success || res.data == null) {
          throw new Error(res?.message || 'Could not submit quiz');
        }
        return res.data;
      })
    );
  }

  // ---------- ATTEMPT HISTORY METHODS ----------

  // get attempt history (all past attempts)
  getAttemptHistory(): Observable<AttemptSummary[]> {
    return this.http.get<ApiResponse<AttemptSummary[]>>(`${this.apiUrl}/submissions/history`).pipe(
      map((res) => {
        if (!res?.success || res.data == null) return [];
        return res.data;
      })
    );
  }

  // get attempt history statistics
  getAttemptStats(): Observable<AttemptStats> {
    const empty: AttemptStats = { totalAttempts: 0, avgSuccessRate: 0, flaggedAttempts: 0, changePercentage: 0 };
    return this.http.get<ApiResponse<AttemptStats>>(`${this.apiUrl}/submissions/history/stats`).pipe(
      map((res) => {
        if (!res?.success || res.data == null) return empty;
        return res.data;
      })
    );
  }

  // ---------- RESOURCE METHODS ----------

  // get all learning resources
  getResources(): Observable<Resource[]> {
    return this.http
      .get<ApiResponse<Resource[]>>(`${this.apiUrl}/resources`)
      .pipe(map((res) => res.data));
  }
}
