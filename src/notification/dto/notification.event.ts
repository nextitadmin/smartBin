import { NotificationType } from '@models/notification.model';

export interface NotificationEventData {
  userId: string;
  title: string;
  text: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

export class NotificationEvent {
  constructor(public data: NotificationEventData) {}
}

export const NotificationEvents = {
  CREATED: 'notification.created',
};
