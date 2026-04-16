import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SecuritySettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-security-settings',
  imports: [FormsModule],
  templateUrl: './security-settings.component.html',
})
export class SecuritySettingsComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);

  security: SecuritySettings = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  };

  passwordMismatch = false;
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.loading = true;
    this.settings
      .getSecurity()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (s) => {
          this.security = {
            ...this.security,
            twoFactorEnabled: s.twoFactorEnabled,
          };
        },
        error: (err: Error) => this.toast.show(err.message || 'Failed to load security settings.', 'error'),
      });
  }

  save(): void {
    if (this.security.newPassword !== this.security.confirmPassword) {
      this.passwordMismatch = true;
      this.toast.show('New password and confirmation must match.', 'error');
      return;
    }
    this.passwordMismatch = false;
    this.saving = true;
    this.settings
      .updateSecurity(this.security)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (saved) => {
          this.security.twoFactorEnabled = saved.twoFactorEnabled;
          this.security.currentPassword = '';
          this.security.newPassword = '';
          this.security.confirmPassword = '';
          this.toast.show('Security settings saved.', 'success');
        },
        error: (err: Error) => this.toast.show(err.message || 'Failed to save security settings.', 'error'),
      });
  }

  logoutAllDevices(): void {
    this.settings.logoutAllDevices().subscribe({
      next: () => this.toast.show('All other sessions have been signed out.', 'info'),
      error: (err: Error) => this.toast.show(err.message || 'Failed to logout active devices.', 'error'),
    });
  }
}
