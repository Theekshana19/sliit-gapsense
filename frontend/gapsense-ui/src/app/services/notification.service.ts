import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, of, throwError } from 'rxjs';
import type { NotificationItem } from '../models/notification/notification.model';
import { environment } from '../../environments/environment';
import type { NotificationType } from '../models/notification/notification.model';

interface NotificationFeedItemDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
  route?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/notifications`;
  private readonly _items = signal<NotificationItem[]>([]);

  /** Reactive list for templates (read-only signal). */
  readonly notifications = this._items.asReadonly();

  constructor() {
    this.refresh();
  }

  refresh(take = 50): void {
    this.http.get<NotificationFeedItemDto[]>(this.base, { params: { take } })
      .pipe(
        map((rows) =>
          rows.map((x) => ({
            id: x.id,
            title: x.title,
            message: x.message,
            type: x.type,
            time: x.time,
            read: x.read,
            route: x.route ?? undefined,
          }))
        ),
        catchError((err) => {
          console.error('Failed to load notifications.', err);
          return of(this._items());
        })
      )
      .subscribe((items) => this._items.set(items));
  }

  getNotifications(): NotificationItem[] {
    return [...this._items()];
  }

  getUnreadCount(): number {
    return this._items().filter((n) => !n.read).length;
  }

  markAsRead(id: string): void {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    this.http.post<void>(`${this.base}/${id}/read`, {}).pipe(catchError(this.pipeError)).subscribe({
      error: () => this.refresh(),
    });
  }

  markAllAsRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
    this.http.post<void>(`${this.base}/mark-all-read`, {}).pipe(catchError(this.pipeError)).subscribe({
      error: () => this.refresh(),
    });
  }

  clearAll(): void {
    this._items.set([]);
    this.http.delete<void>(`${this.base}/clear-all`).pipe(catchError(this.pipeError)).subscribe({
      error: () => this.refresh(),
    });
  }

  private pipeError(err: HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object') {
      const o = body as Record<string, unknown>;
      const msg = o['message'];
      if (typeof msg === 'string' && msg.trim()) {
        return throwError(() => new Error(msg));
      }
    }
    return throwError(() => new Error(err.message || 'Request failed.'));
  }
}
