// module related models - used in module management pages
// a "module" here means an academic subject like "Data Structures" or "Database Systems"

// module status - active modules are currently being taught
export type ModuleStatus = 'Active' | 'Draft' | 'Archived';

// academic programs at SLIIT
export type Program = 'BSc IT' | 'BSc CS' | 'BSc SE' | 'BSc DS';

// semesters
export type Semester = 'Y1S1' | 'Y1S2' | 'Y2S1' | 'Y2S2' | 'Y3S1' | 'Y3S2' | 'Y4S1' | 'Y4S2';

// main module model - represents one academic module
export interface Module {
  id: string;
  moduleCode: string; // like "IT2040"
  moduleName: string;
  description: string;
  program: Program;
  semester: Semester;
  credits: number;
  status: ModuleStatus;
  topicCount: number;
  prerequisiteCount: number;
  createdAt: string;
  updatedAt: string;
}

// filter options for the module management page
export interface ModuleFilter {
  search?: string;
  program?: Program | '';
  semester?: Semester | '';
  status?: ModuleStatus | '';
}

// stats shown at the top of module management page
export interface ModuleStats {
  totalModules: number;
  activeModules: number;
  totalCreditHours: number;
  needsAttention: number;
}
