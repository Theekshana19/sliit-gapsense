import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ProfileSettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';

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

  ngOnInit(): void {
    this.profile = { ...this.settings.getSettings().profile };
  }

  save(): void {
    this.settings.updateProfile(this.profile);
    this.toast.show('Profile settings saved.', 'success');
  }
}
