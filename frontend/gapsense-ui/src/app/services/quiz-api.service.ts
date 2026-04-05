import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface QuizSummaryDto {
  id: string;
  title: string;
  moduleCode: string;
  description: string | null;
  isPublished: boolean;
  createdByUserId: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface QuizTopicScoreInput {
  topicName: string;
  percent: number;
}

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly root = `${API_BASE_URL}/api/simple-quizzes`;

  async getPublishedQuizzes(): Promise<QuizSummaryDto[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<QuizSummaryDto[]>>(this.root)
      );
      return res.success && res.data ? res.data : [];
    } catch {
      return [];
    }
  }

  async submitAttempt(
    quizId: string,
    totalScorePercent: number,
    topicScores: QuizTopicScoreInput[]
  ): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<unknown>>(`${this.root}/${encodeURIComponent(quizId)}/attempts`, {
          totalScorePercent,
          topicScores,
        })
      );
      return !!res.success;
    } catch {
      return false;
    }
  }

  async getMyAttempts(): Promise<unknown[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<unknown[]>>(`${API_BASE_URL}/api/quiz-attempts/me`)
      );
      return res.success && res.data ? res.data : [];
    } catch {
      return [];
    }
  }
}
