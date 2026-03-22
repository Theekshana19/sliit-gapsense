export type RiskLevelKey = 'low' | 'medium' | 'high';

export interface RiskDistributionSegment {
  key: RiskLevelKey;
  label: string;
  percent: number;
  count: number;
  colorClass: string;
}

export interface RiskDistribution {
  total: number;
  segments: RiskDistributionSegment[];
}
