export type NotificationType = 'risk' | 'academic' | 'reminder' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
}

export type NotificationFilter = 'all' | NotificationType;
