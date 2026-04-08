import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { READINESS_RESULT_EXPORT_ID } from '../models/risk-analysis/readiness-result.constants';
import type { ReadinessResultViewModel } from '../models/risk-analysis/readiness-result.model';
import type { ReadinessRiskLevel } from '../models/risk-analysis/readiness-result.model';
import type { TopicPerformanceItem } from '../models/risk-analysis/topic-performance.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ReadinessResultApiDto {
  id: string;
  studentName: string;
  studentId: string;
  moduleCode: string;
  semesterLabel: string;
  attemptLabel: string;
  analysisDateLabel: string;
  totalScorePercent: number;
  riskLevel: string;
  riskDescription: string;
  weakTopicsCount: number;
  weakTopicsSeverityLabel: string;
  weakTopicsHelperText: string;
  actionPlanRecommendationCount: number;
  actionPlanBadgeLabel: string;
  actionPlanHelperText: string;
  interpretationMessage: string;
  topicPerformance: { topicName: string; percent: number }[];
}

/**
 * Readiness diagnostic from GET /api/readiness-results.
 */
@Injectable({ providedIn: 'root' })
export class ReadinessResultService {
  private readonly http = inject(HttpClient);

  private readonly _data = signal<ReadinessResultViewModel | null>(null);
  private readonly _loading = signal(false);
  private readonly _exportPdfLoading = signal(false);
  private readonly _exportError = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly exportPdfLoading = this._exportPdfLoading.asReadonly();
  readonly exportError = this._exportError.asReadonly();

  readonly hasData = computed(() => this._data() !== null);

  private get exportPdfUrl(): string {
    return `${API_BASE_URL}/api/readiness-results`;
  }

  /** Load from API: all results, display first row (or demo id if list empty). */
  async loadFromApi(): Promise<void> {
    this._loading.set(true);
    try {
      const listRes = await firstValueFrom(
        this.http.get<ApiResponse<ReadinessResultApiDto[]>>(
          `${this.exportPdfUrl}`
        )
      );
      if (!listRes.success || !listRes.data?.length) {
        await this.loadById(READINESS_RESULT_EXPORT_ID);
        return;
      }
      this._data.set(mapApiToViewModel(listRes.data[0]));
    } catch {
      await this.loadById(READINESS_RESULT_EXPORT_ID);
    } finally {
      this._loading.set(false);
    }
  }

  private async loadById(id: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<ReadinessResultApiDto>>(
          `${this.exportPdfUrl}/${encodeURIComponent(id)}`
        )
      );
      if (res.success && res.data) {
        this._data.set(mapApiToViewModel(res.data));
      }
    } catch {
      this._data.set(null);
    }
  }

  clearExportError(): void {
    this._exportError.set(null);
  }

  /**
   * Downloads PDF from GET /api/readiness-results/{id}/export-pdf.
   * Uses current view model id when present, otherwise the demo export id.
   */
  async exportPdf(): Promise<void> {
    const id = this._data()?.id ?? READINESS_RESULT_EXPORT_ID;
    this._exportPdfLoading.set(true);
    this._exportError.set(null);
    const url = `${this.exportPdfUrl}/${encodeURIComponent(id)}/export-pdf`;
    try {
      const blob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );
      if (!blob || blob.size === 0) {
        this._exportError.set('Empty PDF response from server.');
        return;
      }
      const fileName = `readiness-result-${id}.pdf`;
      this.triggerBlobDownload(blob, fileName);
    } catch (e) {
      this._exportError.set(this.messageFromExportError(e));
    } finally {
      this._exportPdfLoading.set(false);
    }
  }

  private messageFromExportError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) return 'Readiness report not found.';
      if (e.status === 0) return 'Network error. Is the API running?';
      if (e.error instanceof Blob) {
        return 'Could not export PDF. Please try again.';
      }
      return e.message || 'Could not export PDF.';
    }
    return 'Could not export PDF.';
  }

  private triggerBlobDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /** Wire to share dialog / deep link when backend exists. */
  shareReportPlaceholder(): void {
    console.info('[ReadinessResult] shareReportPlaceholder — connect share flow here');
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeRiskLevel(level: string): ReadinessRiskLevel {
  const l = level?.toLowerCase();
  if (l === 'high' || l === 'medium' || l === 'low') return l;
  return 'medium';
}

function interpretationTone(
  risk: ReadinessRiskLevel
): ReadinessResultViewModel['interpretation']['tone'] {
  if (risk === 'high') return 'warning';
  if (risk === 'low') return 'success';
  return 'info';
}

function scoreBarTone(
  percent: number
): ReadinessResultViewModel['score']['barTone'] {
  if (percent < 40) return 'error';
  if (percent < 60) return 'warning';
  if (percent < 80) return 'neutral';
  return 'success';
}

function topicBarVariant(percent: number): TopicPerformanceItem['barVariant'] {
  return percent < 40 ? 'critical' : 'neutral';
}

function mapApiToViewModel(d: ReadinessResultApiDto): ReadinessResultViewModel {
  const riskLevel = normalizeRiskLevel(d.riskLevel);
  const topicPerformance: TopicPerformanceItem[] = (d.topicPerformance ?? []).map(
    (t) => ({
      topicName: t.topicName,
      percent: t.percent,
      barVariant: topicBarVariant(t.percent),
    })
  );

  return {
    id: d.id,
    student: {
      studentName: d.studentName,
      studentId: d.studentId,
      initials: initialsFromName(d.studentName),
      moduleCode: d.moduleCode,
      semesterLabel: d.semesterLabel,
      attemptLabel: d.attemptLabel,
      analysisDateLabel: d.analysisDateLabel,
    },
    interpretation: {
      message: d.interpretationMessage,
      tone: interpretationTone(riskLevel),
    },
    score: {
      percent: d.totalScorePercent,
      barTone: scoreBarTone(d.totalScorePercent),
    },
    risk: {
      level: riskLevel,
      description: d.riskDescription,
    },
    weakTopics: {
      count: d.weakTopicsCount,
      severityLabel: d.weakTopicsSeverityLabel,
      helperText: d.weakTopicsHelperText,
    },
    actionPlan: {
      recommendationCount: d.actionPlanRecommendationCount,
      badgeLabel: d.actionPlanBadgeLabel,
      helperText: d.actionPlanHelperText,
    },
    topicPerformance,
  };
}
