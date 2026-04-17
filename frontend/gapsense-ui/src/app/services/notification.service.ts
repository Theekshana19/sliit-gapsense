import { Injectable, signal } from '@angular/core';
import type { NotificationItem } from '../models/notification/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _items = signal<NotificationItem[]>([]);

  /** Reactive list for templates (read-only signal). */
  readonly notifications = this._items.asReadonly();

  getNotifications(): NotificationItem[] {
    return [...this._items()];
  }

  getUnreadCount(): number {
    return this._items().filter((n) => !n.read).length;
  }

  markAsRead(id: string): void {
    this._items.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  markAllAsRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  clearAll(): void {
    this._items.set([]);
  }
}
