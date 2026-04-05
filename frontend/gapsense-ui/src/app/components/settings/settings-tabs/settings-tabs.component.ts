import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { SettingsTabId } from '../../../models/settings/settings.model';

@Component({
  standalone: true,
  selector: 'app-settings-tabs',
  imports: [NgClass],
  templateUrl: './settings-tabs.component.html',
})
export class SettingsTabsComponent {
  @Input({ required: true }) activeTab!: SettingsTabId;
  @Output() tabChange = new EventEmitter<SettingsTabId>();

  readonly tabs: readonly { id: SettingsTabId; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'academic', label: 'Academic', icon: 'school' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'lock' },
  ];

  select(tab: SettingsTabId): void {
    this.tabChange.emit(tab);
  }
}
