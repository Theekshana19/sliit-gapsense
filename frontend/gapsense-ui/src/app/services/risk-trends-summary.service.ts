import { computed, Injectable, signal } from '@angular/core';
import type { RiskTrendFilterOption } from '../models/risk-analysis/risk-trend-filter.model';
import type { RiskTrendFilterState } from '../models/risk-analysis/risk-trend-filter.model';
import type { RiskTrendsSummaryViewModel } from '../models/risk-analysis/risk-trends-summary.model';

const MOCK_MODULES: RiskTrendFilterOption[] = [
  { id: 'all', label: 'All Engineering Modules' },
  { id: 'se', label: 'Software Engineering' },
  { id: 'cs', label: 'Computer Science' },
];

const MOCK_BATCHES: RiskTrendFilterOption[] = [
  { id: '2023', label: '2023 Intake' },
  { id: '2022', label: '2022 Intake' },
];

const MOCK_SEMESTERS: RiskTrendFilterOption[] = [
  { id: 's1', label: 'Semester 1' },
  { id: 's2', label: 'Semester 2' },
];

const MOCK_VIEW_MODEL: RiskTrendsSummaryViewModel = {
  summaryMetrics: [
    {
      id: 'm1',
      variant: 'students',
      title: 'Students Analyzed',
      value: '120',
      badgeText: '+12%',
      badgeStyle: 'positive',
      progressPercent: 40,
      accent: 'primary',
    },
    {
      id: 'm2',
      variant: 'readiness',
      title: 'Avg Readiness Score',
      value: '68%',
      helperText: '4% increase from mid-semester baseline',
      accent: 'primary',
    },
    {
      id: 'm3',
      variant: 'high-risk',
      title: 'High-Risk Count',
      value: '15',
      badgeText: 'Urgent',
      badgeStyle: 'error',
      extraCount: 12,
      accent: 'error',
    },
    {
      id: 'm4',
      variant: 'weak-topic',
      title: 'Most Weak Topic',
      value: 'Risk Analysis',
      helperText: '42 students struggling',
      pillLabel: 'PRIORITY INTERVENTION',
      accent: 'primary',
    },
  ],
  riskDistribution: {
    total: 120,
    segments: [
      { key: 'low', label: 'Low Risk', percent: 65, count: 78, colorClass: 'text-blue-800' },
      { key: 'medium', label: 'Medium Risk', percent: 20, count: 24, colorClass: 'text-blue-400' },
      { key: 'high', label: 'High Risk', percent: 15, count: 18, colorClass: 'text-red-600' },
    ],
  },
  weakTopicFrequency: {
    selectedPeriod: 'week',
    items: [
      { topicName: 'Risk Analysis', frequency: 85, maxFrequency: 100 },
      { topicName: 'Data Models', frequency: 45, maxFrequency: 100 },
      { topicName: 'Algorithms', frequency: 78, maxFrequency: 100 },
      { topicName: 'Integration', frequency: 32, maxFrequency: 100 },
      { topicName: 'UML Design', frequency: 55, maxFrequency: 100 },
      { topicName: 'Testing', frequency: 40, maxFrequency: 100 },
    ],
  },
  insight: {
    title: 'Insight Detected',
    text: "Students who struggle with 'Algorithms' also show a 60% higher risk in 'Risk Analysis'. Consider a cross-functional lecture series.",
    icon: 'lightbulb',
  },
  riskProgression: {
    title: 'Risk Progression Trend',
    subtitle: 'Comparison between current and previous cohort',
    currentCohortPoints: [
      { month: 'MAR', value: 52 },
      { month: 'APR', value: 58 },
      { month: 'MAY', value: 72 },
      { month: 'JUN', value: 68 },
      { month: 'JUL', value: 70 },
      { month: 'AUG', value: 74 },
    ],
    previousCohortPoints: [
      { month: 'MAR', value: 50 },
      { month: 'APR', value: 54 },
      { month: 'MAY', value: 60 },
      { month: 'JUN', value: 62 },
      { month: 'JUL', value: 65 },
      { month: 'AUG', value: 68 },
    ],
    peakMarker: {
      label: 'PEAK READINESS',
      value: '72%',
      detail: 'Module: Software Architecture',
      monthKey: 'MAY',
    },
  },
};

/**
 * Mock risk trends summary service. Replace with HTTP + DTO mapping
 * when the backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class RiskTrendsSummaryService {
  private readonly _moduleId = signal('all');
  private readonly _batchId = signal('2023');
  private readonly _semesterId = signal('s1');
  private readonly _period = signal<'week' | 'month'>('week');
  private readonly _exportNotice = signal<string | null>(null);
  private readonly _shareNotice = signal<string | null>(null);

  readonly moduleId = this._moduleId.asReadonly();
  readonly batchId = this._batchId.asReadonly();
  readonly semesterId = this._semesterId.asReadonly();
  readonly period = this._period.asReadonly();
  readonly exportNotice = this._exportNotice.asReadonly();
  readonly shareNotice = this._shareNotice.asReadonly();

  readonly moduleOptions = MOCK_MODULES;
  readonly batchOptions = MOCK_BATCHES;
  readonly semesterOptions = MOCK_SEMESTERS;

  readonly viewModel = computed((): RiskTrendsSummaryViewModel => ({
    ...MOCK_VIEW_MODEL,
    weakTopicFrequency: {
      ...MOCK_VIEW_MODEL.weakTopicFrequency,
      selectedPeriod: this._period(),
    },
  }));

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
