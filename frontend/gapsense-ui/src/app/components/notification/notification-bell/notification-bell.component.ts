import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NotificationDropdownComponent } from '../notification-dropdown/notification-dropdown.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-notification-bell',
  imports: [NotificationDropdownComponent],
  templateUrl: './notification-bell.component.html',
})
export class NotificationBellComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly notificationService = inject(NotificationService);

  readonly open = signal(false);

  readonly unreadCount = computed(() =>
    this.notificationService.notifications().filter((n) => !n.read).length,
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    const next = !this.open();
    this.open.set(next);
    if (next) {
      void this.notificationService.refresh();
    }
  }

  close(): void {
    this.open.set(false);
  }
}
