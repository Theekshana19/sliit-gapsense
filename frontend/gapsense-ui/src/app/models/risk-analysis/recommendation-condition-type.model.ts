export type RecommendationConditionType =
  | 'scoreUnderThreshold'
  | 'scoreOverThreshold';

export const CONDITION_TYPE_LABELS: Record<
  RecommendationConditionType,
  string
> = {
  scoreUnderThreshold: 'Score Under Threshold',
  scoreOverThreshold: 'Score Over Threshold',
};
