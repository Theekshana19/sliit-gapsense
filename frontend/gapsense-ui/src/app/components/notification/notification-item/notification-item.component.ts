import { Component, Input, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import type { NotificationItem } from '../../../models/notification/notification.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-notification-item',
  imports: [NgClass],
  templateUrl: './notification-item.component.html',
})
export class NotificationItemComponent {
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true }) item!: NotificationItem;
  /** Compact row for dropdown; roomier on full page */
  @Input() compact = false;

  onActivate(): void {
    if (!this.item.read) {
      void this.notificationService.markAsRead(this.item.id);
    }
  }

  iconForType(): string {
    switch (this.item.type) {
      case 'risk':
        return 'warning';
      case 'academic':
        return 'school';
      case 'reminder':
        return 'event';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  }

  iconBgClass(): string {
    switch (this.item.type) {
      case 'risk':
        return 'bg-rose-50 text-rose-600';
      case 'academic':
        return 'bg-sky-50 text-sky-700';
      case 'reminder':
        return 'bg-amber-50 text-amber-700';
      case 'system':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }
}
