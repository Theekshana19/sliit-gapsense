import type { InterventionStrategyView } from './intervention-strategy.model';
import type { ProjectionSummaryView } from './projection-summary.model';
import type { WeakTopicMatrixRow } from './weak-topic-row.model';

export interface WeakTopicSummaryCards {
  totalTopicsEvaluated: number;
  totalTopicsHelper: string;
  weakTopicsIdentified: number;
  weakTopicsHelper: string;
  criticalWeakAreas: number;
  criticalHelper: string;
}

/** Full dashboard payload for the Weak Topic Analysis page (mock or API-mapped). */
export interface WeakTopicAnalysisViewModel {
  summary: WeakTopicSummaryCards;
  matrixRows: WeakTopicMatrixRow[];
  intervention: InterventionStrategyView;
  projection: ProjectionSummaryView;
}
