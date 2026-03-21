export type ReadinessTrend = 'up' | 'down' | 'stable';

export interface WeakTopic {
  id: string;
  topicName: string;
  courseCode: string;
  gapScore: number;
  studentCount: number;
  trend: ReadinessTrend;
}

export interface ReadinessOverview {
  id: string;
  cohort: string;
  averageReadiness: number;
  atRiskCount: number;
  updatedAt: string;
}
