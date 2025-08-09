import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationEvent, NotificationEvents } from './dto/notification.event';
import { NotificationInAppService } from './notification.inapp.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationListener {
    private logger = new Logger(NotificationListener.name);
    constructor(
        private readonly notificationService: NotificationInAppService,
        private readonly gateway: NotificationGateway,
    ) { }

    @OnEvent(NotificationEvents.CREATED)
    async handleCreate(event: NotificationEvent) {
        this.logger.log(`Notification event for user ${event.userId}: ${event.title}`);

        // 1) Save to DB
        const doc = await this.notificationService.createNotification({
            userId: event.userId,
            title: event.title,
            message: event.message,
            type: event.type,
            meta: event.meta,
        });

        const payload = {
            id: doc._id,
            title: doc.title,
            message: doc.message,
            type: doc.type,
            meta: doc.meta,
            read: doc.read,
            createdAt: doc.createdAt,
        };

        this.gateway.pushNotificationToUser(event.userId, payload);
    }
}
