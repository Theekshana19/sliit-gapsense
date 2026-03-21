export type RiskSeverity = 'low' | 'medium' | 'high';

export interface RiskReport {
  id: string;
  title: string;
  generatedAt: string;
  severity: RiskSeverity;
  summary: string;
}

export interface RiskHeatmapCell {
  id: string;
  skill: string;
  module: string;
  riskScore: number;
}
