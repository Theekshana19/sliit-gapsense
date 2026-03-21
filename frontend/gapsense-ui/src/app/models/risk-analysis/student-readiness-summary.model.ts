/** Display-ready student context for a readiness diagnostic (mock or API-mapped). */
export interface StudentReadinessSummary {
  studentName: string;
  studentId: string;
  /** Short initials for avatar (e.g. "NS"). */
  initials: string;
  moduleCode: string;
  semesterLabel: string;
  attemptLabel: string;
  analysisDateLabel: string;
}
