import { NotificationType } from "@models/notification";

export class NotificationEvent {
    constructor(
        public readonly userId: string,
        public readonly title: string,
        public readonly message: string,
        public readonly type: NotificationType,
        public readonly meta?: Record<string, any>,
    ) { }
}


export const NotificationEvents = {
    CREATED: 'notification.created',
};