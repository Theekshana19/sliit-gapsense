export type RiskBadgeLabel = 'High Risk' | 'Low Risk' | 'Moderate Risk';

export interface ReassessmentScoreSummary {
  label: string;
  title: string;
  sessionDate: string;
  riskBadge: RiskBadgeLabel;
  scorePercent: number;
  /** When true, uses error/red styling. */
  isHighRisk: boolean;
}
