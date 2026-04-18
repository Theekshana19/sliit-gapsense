import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-notification-dropdown',
  imports: [RouterLink, NotificationItemComponent],
  templateUrl: './notification-dropdown.component.html',
})
export class NotificationDropdownComponent {
  private readonly notificationService = inject(NotificationService);

  @Output() closed = new EventEmitter<void>();

  readonly recent = computed(() => this.notificationService.notifications().slice(0, 8));

  readonly hasAny = computed(() => this.notificationService.notifications().length > 0);

  markAllRead(): void {
    void this.notificationService.markAllAsRead();
  }

  dismiss(): void {
    this.closed.emit();
  }
}
