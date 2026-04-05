import { Injectable, signal } from '@angular/core';
import type { NotificationItem } from '../models/notification/notification.model';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'High-risk student detected',
    message: 'INTE 3123 — 3 students flagged for follow-up this week.',
    type: 'risk',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Low attendance warning',
    message: 'Batch SE-24 — attendance below 75% threshold.',
    type: 'risk',
    time: '18 min ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Low performance alert',
    message: 'Mid-term average dropped vs last semester in Data Structures.',
    type: 'risk',
    time: '1 hour ago',
    read: true,
  },
  {
    id: 'n4',
    title: 'Marks uploaded',
    message: 'Assignment 02 marks published for INTE 3123.',
    type: 'academic',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n5',
    title: 'Assignment submitted',
    message: '12 new submissions pending review for Week 5 lab.',
    type: 'academic',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 'n6',
    title: 'Module updated',
    message: 'Learning outcomes revised for INTE 3123 — please review.',
    type: 'academic',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n7',
    title: 'Upcoming lecture',
    message: 'Lecture tomorrow 9:00 AM — Hall B-204.',
    type: 'reminder',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'n8',
    title: 'Meeting reminder',
    message: 'Faculty curriculum sync in 45 minutes (Teams).',
    type: 'reminder',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n9',
    title: 'Intervention follow-up',
    message: '3 intervention plans due for review by Friday.',
    type: 'reminder',
    time: '2 days ago',
    read: false,
  },
  {
    id: 'n10',
    title: 'Report generated',
    message: 'Semester risk summary PDF is ready to download.',
    type: 'system',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n11',
    title: 'Settings updated',
    message: 'Your notification preferences were saved successfully.',
    type: 'system',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n12',
    title: 'New student added',
    message: '5 students enrolled in INTE 3123 for Semester 2.',
    type: 'system',
    time: '4 days ago',
    read: false,
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _items = signal<NotificationItem[]>([...MOCK_NOTIFICATIONS]);

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
