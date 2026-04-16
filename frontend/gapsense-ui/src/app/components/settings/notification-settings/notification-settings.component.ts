import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { NotificationSettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-notification-settings',
  imports: [FormsModule],
  templateUrl: './notification-settings.component.html',
})
export class NotificationSettingsComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);

  notifications: NotificationSettings = {
    emailAlerts: false,
    studentRiskAlerts: false,
    assignmentReminders: false,
    weeklyReports: false,
  };
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.loading = true;
    this.settings
      .getNotifications()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (value) => (this.notifications = { ...value }),
        error: (err: Error) => this.toast.show(err.message || 'Failed to load notification settings.', 'error'),
      });
  }

  save(): void {
    this.saving = true;
    this.settings
      .updateNotifications(this.notifications)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (saved) => {
          this.notifications = { ...saved };
          this.toast.show('Notification preferences saved.', 'success');
        },
        error: (err: Error) => this.toast.show(err.message || 'Failed to save notification settings.', 'error'),
      });
  }
}
