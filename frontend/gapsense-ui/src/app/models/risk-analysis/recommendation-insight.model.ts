export interface RecommendationInsightMetric {
  value: string;
  label: string;
}

export interface RecommendationInsightView {
  badgeLabel: string;
  title: string;
  explanation: string;
  metrics: RecommendationInsightMetric[];
}
