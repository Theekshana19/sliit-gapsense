import { Injectable, signal } from '@angular/core';
import type {
  AcademicSettings,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from '../models/settings/settings.model';

export interface LecturerSettingsSnapshot {
  profile: ProfileSettings;
  academic: AcademicSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

const INITIAL_PROFILE: ProfileSettings = {
  fullName: 'Dr. Nimal Perera',
  email: 'nimal.perera@sliit.lk',
  phoneNumber: '+94 77 123 4567',
  department: 'Faculty of Computing',
};

const INITIAL_ACADEMIC: AcademicSettings = {
  semester: 'Semester 1',
  academicYear: '2025/2026',
  defaultModule: 'INTE 3123 — Data Structures & Algorithms',
  assignedFaculty: 'Faculty of Computing — Software Engineering',
};

const INITIAL_NOTIFICATIONS: NotificationSettings = {
  emailAlerts: true,
  studentRiskAlerts: true,
  assignmentReminders: false,
  weeklyReports: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly profileState = signal<ProfileSettings>({ ...INITIAL_PROFILE });
  private readonly academicState = signal<AcademicSettings>({ ...INITIAL_ACADEMIC });
  private readonly notificationState = signal<NotificationSettings>({ ...INITIAL_NOTIFICATIONS });
  private readonly twoFactorEnabled = signal(false);

  getSettings(): LecturerSettingsSnapshot {
    return {
      profile: { ...this.profileState() },
      academic: { ...this.academicState() },
      notifications: { ...this.notificationState() },
      security: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: this.twoFactorEnabled(),
      },
    };
  }

  updateProfile(profile: ProfileSettings): void {
    this.profileState.set({ ...profile });
  }

  updateAcademic(academic: AcademicSettings): void {
    this.academicState.set({ ...academic });
  }

  updateNotifications(notifications: NotificationSettings): void {
    this.notificationState.set({ ...notifications });
  }

  updateSecurity(security: SecuritySettings): void {
    this.twoFactorEnabled.set(security.twoFactorEnabled);
  }

  logoutAllDevices(): void {
    // Mock: no backend session invalidation
  }
}
