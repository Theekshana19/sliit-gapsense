export interface BatchReadinessSemesterOption {
  id: string;
  name: string;
  academicYear: string;
  isCurrent: boolean;
}

export interface BatchReadinessModuleOption {
  id: string;
  moduleCode: string;
  moduleName: string;
}

export interface BatchReadinessIntakeOption {
  batchCode: string;
  displayLabel: string;
}

export interface BatchReadinessFilterOptions {
  semesters: BatchReadinessSemesterOption[];
  modules: BatchReadinessModuleOption[];
  intakes: BatchReadinessIntakeOption[];
}

export interface BatchReadinessFilterPayload {
  semesterId: string;
  moduleId?: string | null;
  intakeBatch?: string | null;
}

export interface BatchReadinessSummary {
  totalStudents: number;
  highRiskCount: number;
  batchReadinessScorePercent: number;
  scoreDeltaPercent: number | null;
  interventionPendingCount: number;
  averageCohortImprovementPercent: number | null;
  generatedAtUtc: string;
}

export interface BatchReadinessLedgerRow {
  studentProfileId: string;
  studentId: string;
  fullName: string;
  avatarUrl: string;
  module: string;
  scorePercent: number;
  riskUi: 'high' | 'medium' | 'low';
  statusUi: 'intervention' | 'monitoring' | 'on_track';
}

export interface BatchReadinessLedgerPage {
  items: BatchReadinessLedgerRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BatchReadinessExportData {
  filterDescription: string;
  summary: BatchReadinessSummary;
  ledgerRows: BatchReadinessLedgerRow[];
}
