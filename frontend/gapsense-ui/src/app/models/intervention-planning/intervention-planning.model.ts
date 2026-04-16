import type { InterventionPlan, InterventionStatus, InterventionType, RiskGroup } from '../monitoring/monitoring.model';

export interface InterventionPlanTableRowDto {
  id: string;
  moduleCode: string;
  batch: string;
  riskGroup: string;
  weakTopic: string;
  interventionType: string;
  plannedDate: string;
  status: string;
  assignedLecturer: string | null;
  notes: string | null;
  isDraft: boolean;
}

export interface InterventionPlanningDashboardDto {
  successRatePercent: number;
  successSummary: string;
  pendingActionsCount: number;
  pendingActionLines: string[];
}

export function mapInterventionPlanRowToUi(r: InterventionPlanTableRowDto): InterventionPlan {
  return {
    id: r.id,
    courseCode: r.moduleCode,
    studentRef: r.batch,
    title: r.weakTopic,
    interventionType: r.interventionType as InterventionType,
    dueDate: r.plannedDate,
    status: r.status as InterventionStatus,
    riskGroup: r.riskGroup as RiskGroup,
    actions: r.notes ?? '',
  };
}

export interface CreateInterventionPlanPayload {
  moduleCode: string;
  batch: string;
  riskGroup: string;
  weakTopic: string;
  interventionType: string;
  plannedDate: string;
  status: string;
  assignedLecturer?: string | null;
  notes?: string | null;
  studentProfileId?: string | null;
  isDraft: boolean;
}
