// semester offering models - used in semester module offerings page
// manages which modules are offered in which semester and intake

// offering status
export type OfferingStatus = 'Published' | 'Draft' | 'Inactive';

// main semester offering model
export interface SemesterOffering {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  program: string;
  intake: string; // like "February 2024"
  semester: string; // like "Y3S2"
  lecturerName: string;
  lecturerAvatar: string; // initials like "AP"
  avatarColor: string; // background color class
  status: OfferingStatus;
  createdAt: string;
}

// filter options for semester offerings page
export interface OfferingFilter {
  academicYear?: string;
  semester?: string;
  program?: string;
  intake?: string;
}

// stats for semester offerings page
export interface OfferingStats {
  completionPercentage: number;
  attentionNeeded: number;
  efficiencyGrowth: number;
}
