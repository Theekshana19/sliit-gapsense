export type RiskSummaryMetricVariant = 'students' | 'readiness' | 'high-risk' | 'weak-topic';

export interface RiskSummaryMetric {
  id: string;
  variant: RiskSummaryMetricVariant;
  /** Card title label */
  title: string;
  /** Main displayed value (number or string like "68%") */
  value: string;
  /** Optional badge text (e.g. "+12%", "Urgent") */
  badgeText?: string;
  /** Badge style: positive, error, neutral */
  badgeStyle?: 'positive' | 'error' | 'neutral';
  /** Progress bar percent (0-100) for students variant */
  progressPercent?: number;
  /** Helper text below value */
  helperText?: string;
  /** For weak-topic: topic name as value, student count in helperText */
  /** Avatar/extra count for high-risk variant (e.g. 12) */
  extraCount?: number;
  /** Pill label for weak-topic (e.g. "PRIORITY INTERVENTION") */
  pillLabel?: string;
  /** Left border accent: primary, error, secondary */
  accent: 'primary' | 'error' | 'secondary';
}
