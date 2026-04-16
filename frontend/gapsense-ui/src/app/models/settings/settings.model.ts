export type SettingsTabId = 'profile' | 'academic' | 'notifications' | 'security';

export interface ProfileSettings {
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
}

export interface AcademicSettings {
  semester: string;
  academicYear: string;
  defaultModule: string;
  assignedFaculty: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  studentRiskAlerts: boolean;
  assignmentReminders: boolean;
  weeklyReports: boolean;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

export interface LecturerAcademicOptions {
  semesterOptions: string[];
  yearOptions: string[];
}

export interface LecturerSettingsBundleDto {
  profile: ProfileSettings;
  academic: AcademicSettings;
  notifications: NotificationSettings;
  security: Omit<SecuritySettings, 'currentPassword' | 'newPassword' | 'confirmPassword'>;
}
