import type { FollowUpQueueDto } from '../follow-up-queue.model';

export interface SemesterDto {
  id: string;
  name: string;
  academicYear: string;
  term: number;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface DashboardSummaryDto {
  semesterId: string;
  semesterName: string;
  totalStudents: number;
  activeModules: number;
  highRiskStudents: number;
  averageReadinessScore: number;
  totalStudentsTrendNote: string | null;
  highRiskTrendNote: string | null;
  readinessTargetNote: string | null;
}

export interface DashboardReadinessTrendPointDto {
  label: string;
  currentPeriod: number;
  previousPeriod: number;
}

export interface DashboardReadinessTrendDto {
  currentYearLabel: number;
  previousYearLabel: number;
  points: DashboardReadinessTrendPointDto[];
}

export interface DashboardRiskSliceDto {
  level: string;
  count: number;
  percent: number;
}

export interface DashboardRiskDistributionDto {
  totalAtRisk: number;
  slices: DashboardRiskSliceDto[];
}

export interface DashboardMilestoneDto {
  id: string;
  avatarInitial: string;
  fullName: string;
  studentId: string;
  module: string;
  previousScore: number;
  currentScore: number;
  statusLabel: string;
  statusTone: string;
}

export interface DashboardFullDto {
  summary: DashboardSummaryDto;
  readinessTrend: DashboardReadinessTrendDto;
  riskDistribution: DashboardRiskDistributionDto;
  milestones: DashboardMilestoneDto[];
  generatedAtUtc: string;
  /** Included with dashboard/full so the follow-up widget does not need a second HTTP call. */
  followUpQueue: FollowUpQueueDto;
  followUpQueueError: string | null;
}
