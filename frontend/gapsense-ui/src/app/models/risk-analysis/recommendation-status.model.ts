export type RecommendationRuleStatus = 'active' | 'paused';

export const STATUS_LABELS: Record<RecommendationRuleStatus, string> = {
  active: 'Active',
  paused: 'Paused',
};
