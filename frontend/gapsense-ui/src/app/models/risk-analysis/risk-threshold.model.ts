export type RiskThresholdStatus = 'active' | 'inactive';

export interface RiskThreshold {
  id: string;
  ruleName: string;
  description?: string;
  lowRiskMin: number;
  mediumRiskMin: number;
  mediumRiskMax: number;
  highRiskMax: number;
  status: RiskThresholdStatus;
  notes: string;
  updatedAt: string;
}

/** Derived display ranges: High 0–highRiskMax, Medium mediumRiskMin–mediumRiskMax, Low lowRiskMin–100 */
export function formatLowRiskRange(t: RiskThreshold): string {
  return `${t.lowRiskMin}-100%`;
}

export function formatMediumRiskRange(t: RiskThreshold): string {
  return `${t.mediumRiskMin}-${t.mediumRiskMax}%`;
}

export function formatHighRiskRange(t: RiskThreshold): string {
  return `0-${t.highRiskMax}%`;
}
