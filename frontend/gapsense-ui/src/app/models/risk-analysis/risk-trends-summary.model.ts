import type { RiskSummaryMetric } from './risk-summary-metric.model';
import type { RiskDistribution } from './risk-distribution.model';
import type { WeakTopicFrequencyItem } from './weak-topic-frequency-item.model';
import type { RiskInsight } from './risk-insight.model';
import type { RiskProgressionPoint } from './risk-progression-point.model';
import type { PeakReadinessMarker } from './peak-readiness-marker.model';

/** Full view model for the Risk Trends & Summary page (mock or API-mapped). */
export interface RiskTrendsSummaryViewModel {
  summaryMetrics: RiskSummaryMetric[];
  riskDistribution: RiskDistribution;
  weakTopicFrequency: {
    items: WeakTopicFrequencyItem[];
    selectedPeriod: 'week' | 'month';
  };
  insight: RiskInsight;
  riskProgression: {
    title: string;
    subtitle: string;
    currentCohortPoints: RiskProgressionPoint[];
    previousCohortPoints: RiskProgressionPoint[];
    peakMarker: PeakReadinessMarker;
  };
}
