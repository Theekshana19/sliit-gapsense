export type NotificationType = 'risk' | 'academic' | 'reminder' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
  route?: string;
}

export type NotificationFilter = 'all' | NotificationType;
