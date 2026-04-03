import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { NotificationSettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';

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

  ngOnInit(): void {
    this.notifications = { ...this.settings.getSettings().notifications };
  }

  save(): void {
    this.settings.updateNotifications(this.notifications);
    this.toast.show('Notification preferences saved.', 'success');
  }
}
