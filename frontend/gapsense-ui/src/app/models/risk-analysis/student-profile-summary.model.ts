export interface StudentProfileSummaryView {
  studentId: string;
  fullName: string;
  yearSemesterText: string;
  avatarUrl?: string;
  module: string;
  attendance: string;
  status: 'active' | 'inactive' | 'at-risk';
}
