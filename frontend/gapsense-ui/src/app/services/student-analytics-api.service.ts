import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type { WeakTopicAnalysisViewModel } from '../models/risk-analysis/weak-topic-analysis.model';
import type { PersonalizedRecommendationsViewModel } from '../models/risk-analysis/personalized-recommendations-view.model';
import type { PersonalizedLearningPathViewModel } from '../models/risk-analysis/personalized-learning-path.model';
import type { ReassessmentComparisonViewModel } from '../models/risk-analysis/reassessment-comparison.model';
import type { RiskTrendsSummaryViewModel } from '../models/risk-analysis/risk-trends-summary.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** API GET wrappers for /api/student-analytics (requires Bearer token). */
@Injectable({ providedIn: 'root' })
export class StudentAnalyticsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/student-analytics`;

  async fetchWeakTopics(moduleCode?: string): Promise<WeakTopicAnalysisViewModel | null> {
    const q = moduleCode ? `?moduleCode=${encodeURIComponent(moduleCode)}` : '';
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<WeakTopicAnalysisViewModel>>(`${this.base}/weak-topics${q}`)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }

  async fetchRecommendations(): Promise<PersonalizedRecommendationsViewModel | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<PersonalizedRecommendationsViewModel>>(`${this.base}/recommendations`)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }

  async fetchReadinessProfile(): Promise<{
    studentDisplayName: string;
    studentCode: string;
    recentAssessments: Array<{
      id: string;
      assessmentName: string;
      date: string;
      score: string;
      outcome: string;
      trendDirection: string;
      trendPercent: string;
    }>;
  } | null> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<unknown>>(`${this.base}/readiness-profile`));
      return res.success && res.data ? (res.data as never) : null;
    } catch {
      return null;
    }
  }

  async fetchLearningPath(): Promise<PersonalizedLearningPathViewModel | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<PersonalizedLearningPathViewModel>>(`${this.base}/learning-path`)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }

  async fetchReassessment(): Promise<ReassessmentComparisonViewModel | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<ReassessmentComparisonViewModel>>(`${this.base}/reassessment`)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }

  async fetchRiskTrends(): Promise<RiskTrendsSummaryViewModel | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<RiskTrendsSummaryViewModel>>(`${this.base}/risk-trends`)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }
}
