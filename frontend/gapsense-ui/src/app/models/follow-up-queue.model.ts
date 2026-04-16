export interface FollowUpTaskDto {
  id: string;
  studentProfileId: string;
  studentId: string | null;
  studentFullName: string | null;
  studentCurrentModule: string | null;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  priority: string;
  assignedTo: string;
  reminderSentAt: string | null;
  isDismissed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface FollowUpQueueDto {
  count: number;
  message: string;
  items: FollowUpTaskDto[];
}

export interface FollowUpRecentNoteDto {
  id: string;
  lecturerName: string;
  studentName: string;
  noteText: string;
  createdAt: string;
}

export interface FollowUpTrendDto {
  completionRatePercent: number;
  changePercent: number;
  monthlyCompletionPercents: number[];
}

export interface FollowUpActiveProgramDto {
  programName: string;
  studentCount: number;
  percentage: number;
}

export interface FollowUpManagementDto {
  totalCount: number;
  overdueCount: number;
  pendingCount: number;
  moduleOptions: string[];
  items: FollowUpTaskDto[];
  recentNotes: FollowUpRecentNoteDto[];
  trend: FollowUpTrendDto;
  activePrograms: FollowUpActiveProgramDto[];
}
