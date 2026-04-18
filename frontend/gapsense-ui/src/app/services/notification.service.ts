import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type { NotificationItem, NotificationType } from '../models/notification/notification.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE_URL;

  private readonly _items = signal<NotificationItem[]>([]);

  /** Reactive list for templates (read-only signal). */
  readonly notifications = this._items.asReadonly();

  async refresh(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<NotificationDto[]>>(`${this.base}/api/Notifications`),
      );
      const list = res.success && res.data ? res.data.map((d) => this.mapDto(d)) : [];
      this._items.set(list);
    } catch {
      this._items.set([]);
    }
  }

  private mapDto(d: NotificationDto): NotificationItem {
    return {
      id: d.id,
      title: d.title,
      message: d.message,
      type: this.normalizeType(d.type),
      read: d.isRead,
      time: new Date(d.createdAtUtc).toLocaleString(),
    };
  }

  private normalizeType(t: string): NotificationType {
    if (t === 'risk' || t === 'academic' || t === 'reminder' || t === 'system') {
      return t;
    }
    return 'system';
  }

  getNotifications(): NotificationItem[] {
    return [...this._items()];
  }

  getUnreadCount(): number {
    return this._items().filter((n) => !n.read).length;
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.patch<ApiResponse<unknown>>(`${this.base}/api/Notifications/${id}/read`, {}));
    } catch {
      return;
    }
    await this.refresh();
  }

  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch<ApiResponse<unknown>>(`${this.base}/api/Notifications/mark-all-read`, {}),
      );
    } catch {
      return;
    }
    await this.refresh();
  }

  async clearAll(): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<ApiResponse<unknown>>(`${this.base}/api/Notifications`));
    } catch {
      return;
    }
    await this.refresh();
  }
}
