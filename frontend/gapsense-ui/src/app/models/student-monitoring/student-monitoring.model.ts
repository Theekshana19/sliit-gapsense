export type RiskLevelUi = 'critical' | 'moderate' | 'low';

export interface StudentProfileListItem {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  currentModule: string;
  riskLevel: string;
  riskScore: number;
  weakTopicNames: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface WeakTopicDto {
  id: string;
  topicName: string;
  severity: string;
  notes: string | null;
  createdAt: string;
}

export interface InterventionAssignmentDto {
  id: string;
  assignedToName: string;
  assignedToRole: string;
  interventionType: string;
  priority: string;
  note: string | null;
  dueDate: string;
  followUpDate: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MonitoringNoteDto {
  id: string;
  noteType: string;
  noteText: string;
  addedBy: string;
  createdAt: string;
}

export interface MeetingDto {
  id: string;
  title: string;
  description: string | null;
  scheduledDate: string;
  meetingType: string;
  status: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReferralDto {
  id: string;
  referralType: string;
  referredTo: string;
  reason: string;
  status: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface StudentMonitoringDetails {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string | null;
  batch: string;
  year: number;
  semester: string;
  degreeProgram: string;
  gpa: number;
  attendancePercentage: number;
  recentAssessmentScore: number;
  riskScore: number;
  riskLevel: string;
  performanceTrend: string;
  currentModule: string;
  isActive: boolean;
  weakTopics: WeakTopicDto[];
  interventions: InterventionAssignmentDto[];
  notes: MonitoringNoteDto[];
  meetings: MeetingDto[];
  referrals: ReferralDto[];
}

export interface ModuleRiskBar {
  label: string;
  pct: number;
  isHigh: boolean;
}

export interface SuggestedIntervention {
  title: string;
  description: string;
}

export interface MonitoringSummary {
  criticalRiskCases: number;
  activeInterventions: number;
  studentsRecovered: number;
  successRatePercent: number;
  moduleRiskBars: ModuleRiskBar[];
  suggestedInterventions: SuggestedIntervention[];
  totalHighRiskMonitored: number;
}

export interface CreateInterventionAssignmentPayload {
  studentProfileId: string;
  assignedToName: string;
  assignedToRole: string;
  interventionType: string;
  priority: string;
  note: string | null;
  dueDate: string;
  followUpDate: string | null;
  status: string;
}

export interface UpdateInterventionAssignmentPayload {
  assignedToName: string;
  assignedToRole: string;
  interventionType: string;
  priority: string;
  note: string | null;
  dueDate: string;
  followUpDate: string | null;
  status: string;
  isActive: boolean;
}

export interface CreateMonitoringNotePayload {
  studentProfileId: string;
  noteType: string;
  noteText: string;
  addedBy: string;
}

export interface CreateMeetingPayload {
  studentProfileId: string;
  title: string;
  description: string | null;
  scheduledDate: string;
  meetingType: string;
  status: string;
  createdBy: string;
}

export interface UpdateMeetingPayload {
  title: string;
  description: string | null;
  scheduledDate: string;
  meetingType: string;
  status: string;
  isActive: boolean;
}

export interface CreateReferralPayload {
  studentProfileId: string;
  referralType: string;
  referredTo: string;
  reason: string;
  status: string;
  createdBy: string;
}

export interface UpdateReferralPayload {
  referralType: string;
  referredTo: string;
  reason: string;
  status: string;
  isActive: boolean;
}

export type MonitoringModalMode = 'assign' | 'note' | 'meeting' | 'referral';
