/** Filter state for personalized recommendations (ready for API params). */
export interface RecommendationFilterState {
  studentId?: string;
  moduleId?: string;
  semesterId?: string;
  priorityLevel?: 'high' | 'medium' | 'all';
}
