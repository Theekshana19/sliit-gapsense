import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { RiskTrendFilterOption } from '../models/risk-analysis/risk-trend-filter.model';
import type { RiskTrendFilterState } from '../models/risk-analysis/risk-trend-filter.model';
import type { RiskTrendsSummaryViewModel } from '../models/risk-analysis/risk-trends-summary.model';

/** Single neutral filter row — student analytics API is scoped to the signed-in user. */
const SCOPE_ONLY: RiskTrendFilterOption[] = [{ id: 'me', label: 'Your attempts' }];

function emptyRiskTrends(period: 'week' | 'month'): RiskTrendsSummaryViewModel {
  const now = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return {
    summaryMetrics: [
      {
        id: 'm1',
        variant: 'readiness',
        title: 'Latest score',
        value: '0%',
        accent: 'primary',
        helperText: 'From most recent attempt',
      },
      {
        id: 'm2',
        variant: 'high-risk',
        title: 'Attempts tracked',
        value: '0',
        accent: 'secondary',
        helperText: 'Quiz submissions',
      },
    ],
    riskDistribution: {
      total: 1,
      segments: [
        { key: 'high', label: 'High risk', percent: 0, count: 0, colorClass: 'red' },
        { key: 'medium', label: 'Moderate', percent: 0, count: 0, colorClass: 'amber' },
        { key: 'low', label: 'Low risk', percent: 0, count: 0, colorClass: 'emerald' },
      ],
    },
    weakTopicFrequency: {
      selectedPeriod: period,
      items: [],
    },
    insight: {
      title: 'Trend',
      text: 'Complete assessments to see progression.',
      icon: 'trending_up',
    },
    riskProgression: {
      title: 'Score progression',
      subtitle: 'Average score by month (your attempts)',
      currentCohortPoints: [{ month: now, value: 0 }],
      previousCohortPoints: [],
      peakMarker: {
        label: 'Latest average',
        value: '0%',
        detail: 'Most recent month bucket',
        monthKey: now,
      },
    },
  };
}

@Injectable({ providedIn: 'root' })
export class RiskTrendsSummaryService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly _remote = signal<RiskTrendsSummaryViewModel | null>(null);

  private readonly _moduleId = signal('me');
  private readonly _batchId = signal('me');
  private readonly _semesterId = signal('me');
  private readonly _period = signal<'week' | 'month'>('week');
  private readonly _exportNotice = signal<string | null>(null);
  private readonly _shareNotice = signal<string | null>(null);

  readonly moduleId = this._moduleId.asReadonly();
  readonly batchId = this._batchId.asReadonly();
  readonly semesterId = this._semesterId.asReadonly();
  readonly period = this._period.asReadonly();
  readonly exportNotice = this._exportNotice.asReadonly();
  readonly shareNotice = this._shareNotice.asReadonly();

  readonly moduleOptions = SCOPE_ONLY;
  readonly batchOptions = SCOPE_ONLY;
  readonly semesterOptions = SCOPE_ONLY;

  readonly viewModel = computed((): RiskTrendsSummaryViewModel => {
    const r = this._remote();
    const base = r ?? emptyRiskTrends(this._period());
    return {
      ...base,
      weakTopicFrequency: {
        ...base.weakTopicFrequency,
        selectedPeriod: this._period(),
      },
    };
  });

  async tryLoadFromApi(): Promise<void> {
    const data = await this.analyticsApi.fetchRiskTrends();
    if (data) this._remote.set(data);
  }

  readonly filterState = computed((): RiskTrendFilterState => ({
    moduleId: this._moduleId(),
    batchId: this._batchId(),
    semesterId: this._semesterId(),
  }));

  setModuleId(id: string): void {
    this._moduleId.set(id);
  }

  setBatchId(id: string): void {
    this._batchId.set(id);
  }

  setSemesterId(id: string): void {
    this._semesterId.set(id);
  }

  setPeriod(p: 'week' | 'month'): void {
    this._period.set(p);
  }

  clearExportNotice(): void {
    this._exportNotice.set(null);
  }

  clearShareNotice(): void {
    this._shareNotice.set(null);
  }

  requestExportPdf(): void {
    const msg = 'PDF export will be available when the reporting API is connected.';
    this._exportNotice.set(msg);
    window.setTimeout(() => {
      if (this._exportNotice() === msg) this._exportNotice.set(null);
    }, 8000);
  }

  requestShareInsight(): void {
    const msg = 'Share insight will be available when the API is connected.';
    this._shareNotice.set(msg);
    window.setTimeout(() => {
      if (this._shareNotice() === msg) this._shareNotice.set(null);
    }, 8000);
  }
}
