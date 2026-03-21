import type { StudentReadinessSummary } from './student-readiness-summary.model';
import type { TopicPerformanceItem } from './topic-performance.model';

export type ReadinessRiskLevel = 'high' | 'medium' | 'low';

/** Overall score block. */
export interface ReadinessScoreSummary {
  percent: number;
  /** Bar color hint; if omitted, UI may derive from percent. */
  barTone?: 'error' | 'warning' | 'success' | 'neutral';
}

export interface ReadinessRiskSummary {
  level: ReadinessRiskLevel;
  description: string;
}

export interface ReadinessWeakTopicsSummary {
  count: number;
  severityLabel: string;
  helperText: string;
}

export interface ReadinessActionPlanSummary {
  recommendationCount: number;
  badgeLabel: string;
  helperText: string;
}

export interface ReadinessInterpretation {
  message: string;
  tone: 'warning' | 'info' | 'success';
}

/**
 * Full readiness diagnostic view — replace mock source in ReadinessResultService
 * with API mapping when backend is available.
 */
export interface ReadinessResultViewModel {
  /** Server id used for PDF export and future GET-by-id APIs. */
  id: string;
  student: StudentReadinessSummary;
  interpretation: ReadinessInterpretation;
  score: ReadinessScoreSummary;
  risk: ReadinessRiskSummary;
  weakTopics: ReadinessWeakTopicsSummary;
  actionPlan: ReadinessActionPlanSummary;
  topicPerformance: TopicPerformanceItem[];
}
