import type { StudentProfileSummaryView } from './student-profile-summary.model';
import type { AcademicCredentialView } from './academic-credential.model';
import type { TopicMasteryItemView } from './topic-mastery-item.model';
import type { AssessmentTrajectoryItemView } from './assessment-trajectory-item.model';

export type RiskLevelLabel = 'elevated' | 'low' | 'moderate' | 'critical';

export interface RiskLevelView {
  label: string;
  description: string;
  requiresIntervention: boolean;
}

/** Full view model for the Student Readiness Profile page (mock or API-mapped). */
export interface StudentReadinessProfileViewModel {
  summary: StudentProfileSummaryView;
  riskLevel: RiskLevelView;
  credentials: AcademicCredentialView[];
  topicMastery: {
    overallPercent: number;
    proficientLabel: string;
    lastAssessmentText: string;
    items: TopicMasteryItemView[];
  };
  assessmentTrajectory: {
    items: AssessmentTrajectoryItemView[];
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
  };
}
