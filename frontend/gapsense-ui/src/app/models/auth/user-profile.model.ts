import type { AuthRole } from './auth-role.model';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  role: AuthRole;
  profileImagePath: string | null;
  studentId?: string | null;
  batch?: string | null;
  degreeProgram?: string | null;
  staffId?: string | null;
  department?: string | null;
  specialization?: string | null;
  adminCode?: string | null;
}

export interface UpdateMyProfileRequest {
  fullName: string;
  batch?: string | null;
  degreeProgram?: string | null;
  department?: string | null;
  specialization?: string | null;
  adminCode?: string | null;
}

