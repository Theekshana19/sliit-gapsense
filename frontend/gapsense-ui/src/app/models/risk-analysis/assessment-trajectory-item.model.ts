export type AssessmentOutcome = 'ready' | 'not_ready' | 'marginal';

export type AssessmentTrendDirection = 'up' | 'down';

export interface AssessmentTrajectoryItemView {
  id: string;
  assessmentName: string;
  date: string;
  score: string;
  outcome: AssessmentOutcome;
  trendDirection: AssessmentTrendDirection;
  trendPercent: string;
}
