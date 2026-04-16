export type ReportsFormat = 'pdf' | 'csv';
export type ReportsType = 'readiness' | 'module_risk' | 'weak_topic';

export interface ReportsSemesterOptionDto {
  id: string;
  name: string;
  academicYear: string;
  isCurrent: boolean;
}

export interface ReportsModuleOptionDto {
  id: string;
  moduleCode: string;
  moduleName: string;
}

export interface ReportsIntakeOptionDto {
  batchCode: string;
  displayLabel: string;
}

export interface ReportsOptionsDto {
  semesters: ReportsSemesterOptionDto[];
  modules: ReportsModuleOptionDto[];
  intakes: ReportsIntakeOptionDto[];
}

export interface GenerateReportPayload {
  reportType: ReportsType;
  format: ReportsFormat;
  semesterId: string;
  batch: string;
  moduleId: string | null;
}

export interface GenerateReportResponseDto {
  reportId: string;
  fileName: string;
  status: string;
  generatedAtUtc: string;
}

export interface ReportHistoryItemDto {
  reportId: string;
  fileName: string;
  fileMeta: string;
  batch: string;
  generatedBy: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
  isPdf: boolean;
  generatedAtUtc: string;
}

export interface ReportsStatsDto {
  lastMonthExports: number;
  mostExported: string;
  mostExportedCount: number;
}
