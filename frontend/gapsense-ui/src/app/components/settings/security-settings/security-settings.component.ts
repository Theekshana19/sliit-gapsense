import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SecuritySettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';

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

  ngOnInit(): void {
    const s = this.settings.getSettings().security;
    this.security = {
      ...s,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  save(): void {
    if (this.security.newPassword !== this.security.confirmPassword) {
      this.passwordMismatch = true;
      this.toast.show('New password and confirmation must match.', 'error');
      return;
    }
    this.passwordMismatch = false;
    this.settings.updateSecurity(this.security);
    this.security.currentPassword = '';
    this.security.newPassword = '';
    this.security.confirmPassword = '';
    this.toast.show('Security settings saved.', 'success');
  }

  logoutAllDevices(): void {
    this.settings.logoutAllDevices();
    this.toast.show('All other sessions have been signed out locally.', 'info');
  }
}
