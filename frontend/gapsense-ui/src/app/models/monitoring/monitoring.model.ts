export type InterventionStatus = 'planned' | 'active' | 'completed';

export type RiskGroup = 'high' | 'medium' | 'low';

export type InterventionType =
  | 'extra-support'
  | 'learning-resource'
  | 'remedial'
  | 'mentoring'
  | 'workshop'
  | 'tutorial'
  | 'group-discussion';

export interface InterventionPlan {
  id: string;
  title: string;
  studentRef: string;
  courseCode: string;
  actions: string;
  dueDate: string;
  status: InterventionStatus;
  riskGroup: RiskGroup;
  interventionType: InterventionType;
  /** When loaded from StudentInterventions API (open | closed). */
  apiStatus?: 'open' | 'closed';
}
