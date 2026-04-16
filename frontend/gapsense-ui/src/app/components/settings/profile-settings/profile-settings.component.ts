import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ProfileSettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-profile-settings',
  imports: [FormsModule],
  templateUrl: './profile-settings.component.html',
})
export class ProfileSettingsComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);

  profile: ProfileSettings = {
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
  };
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.loading = true;
    this.settings
      .getProfile()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (profile) => (this.profile = { ...profile }),
        error: (err: Error) => this.toast.show(err.message || 'Failed to load profile settings.', 'error'),
      });
  }

  save(): void {
    this.saving = true;
    this.settings
      .updateProfile(this.profile)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (saved) => {
          this.profile = { ...saved };
          this.toast.show('Profile settings saved.', 'success');
        },
        error: (err: Error) => this.toast.show(err.message || 'Failed to save profile settings.', 'error'),
      });
  }
}
