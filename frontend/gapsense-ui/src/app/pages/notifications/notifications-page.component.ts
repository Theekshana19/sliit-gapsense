import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NotificationItemComponent } from '../../components/notification/notification-item/notification-item.component';
import type { NotificationFilter } from '../../models/notification/notification.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-notifications-page',
  imports: [NotificationItemComponent, NgClass],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly filter = signal<NotificationFilter>('all');

  readonly filters: readonly { id: NotificationFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'risk', label: 'Risk' },
    { id: 'academic', label: 'Academic' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'system', label: 'System' },
  ];

  readonly filtered = computed(() => {
    const list = this.notificationService.notifications();
    const f = this.filter();
    if (f === 'all') {
      return list;
    }
    return list.filter((n) => n.type === f);
  });

  readonly hasAny = computed(() => this.notificationService.notifications().length > 0);

  async ngOnInit(): Promise<void> {
    await this.notificationService.refresh();
  }

  setFilter(f: NotificationFilter): void {
    this.filter.set(f);
  }

  markAllRead(): void {
    void this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    void this.notificationService.clearAll();
  }
}
