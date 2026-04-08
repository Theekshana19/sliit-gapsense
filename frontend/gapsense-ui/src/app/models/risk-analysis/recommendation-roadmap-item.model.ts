export type RoadmapStepStatus = 'completed' | 'pending';

export interface RecommendationRoadmapItem {
  stepNumber: number;
  label: string;
  status: RoadmapStepStatus;
}

export interface RecommendationRoadmapView {
  title: string;
  items: RecommendationRoadmapItem[];
  updateButtonLabel: string;
}
