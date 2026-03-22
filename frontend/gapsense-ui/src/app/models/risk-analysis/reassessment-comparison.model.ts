import type { ReassessmentScoreSummary } from './reassessment-score-summary.model';
import type { ReassessmentTopicComparison } from './reassessment-topic-comparison.model';
import type { ReassessmentTopicBreakdownItem } from './reassessment-topic-breakdown-item.model';
import type { ReassessmentImprovementSummary } from './reassessment-improvement-summary.model';
import type { ReassessmentObservation } from './reassessment-observation.model';
import type { ReadinessCertificateAction } from './readiness-certificate-action.model';

/** Full view model for the Reassessment Comparison page (mock or API-mapped). */
export interface ReassessmentComparisonViewModel {
  improvementDelta: ReassessmentImprovementSummary;
  attempt1Score: ReassessmentScoreSummary;
  reassessmentScore: ReassessmentScoreSummary;
  topicComparisons: ReassessmentTopicComparison[];
  topicBreakdown: ReassessmentTopicBreakdownItem[];
  observation: ReassessmentObservation;
  certificateAction: ReadinessCertificateAction;
}
