import { Component, signal } from '@angular/core';
import { AcademicSettingsComponent } from '../../components/settings/academic-settings/academic-settings.component';
import { NotificationSettingsComponent } from '../../components/settings/notification-settings/notification-settings.component';
import { ProfileSettingsComponent } from '../../components/settings/profile-settings/profile-settings.component';
import { SecuritySettingsComponent } from '../../components/settings/security-settings/security-settings.component';
import { SettingsTabsComponent } from '../../components/settings/settings-tabs/settings-tabs.component';
import type { SettingsTabId } from '../../models/settings/settings.model';

@Component({
  standalone: true,
  selector: 'app-settings-page',
  imports: [
    SettingsTabsComponent,
    ProfileSettingsComponent,
    AcademicSettingsComponent,
    NotificationSettingsComponent,
    SecuritySettingsComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsPageComponent {
  readonly activeTab = signal<SettingsTabId>('profile');

  setTab(tab: SettingsTabId): void {
    this.activeTab.set(tab);
  }
}
