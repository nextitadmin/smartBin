import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MailNotificationEvents,
  SendEmailEvent,
  Templates,
  InAppNotificationEvents,
  SendInAppEvent,
} from './dto/event';
import { MailerService } from './mailer.service';
import { events } from '@common/constants';
import { NotificationEvent } from './dto/notification.event';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  QueryNotificationDto,
  UpdateNotificationDto,
} from './dto/notification.dto';
import { Notification, NotificationDocument } from '@models/notification.model';
import { NotificationSettingsService } from './notification-setting.service';
import { AuthUser } from '@common/types';
import { UpdateNotificationSettingsDto } from './dto/notifification-settings.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notifications: Model<NotificationDocument>,

    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @OnEvent(events.notifications.created)
  async createNotification(event: NotificationEvent) {
    //TODO: Will handle idempotency later
    const { userId, title, text, type, metadata } = event.data;
    const idempotencyKey = `${userId}-${type}`;

    // find their notification settings as well
    return this.notifications.create(event.data);
  }

  async getUserNotifications(userId: string, query: QueryNotificationDto) {
    return this.notifications
      .find({ userId, ...query })
      .sort({ createdAt: -1 });
  }

  async updateNotification(
    updateNotification: UpdateNotificationDto & { id: string },
  ) {
    const { id, ...updateData } = updateNotification;
    return this.notifications.findByIdAndUpdate(
      id,
      { $set: { isRead: updateData.isRead } },
      { new: true },
    );
  }

  async markAllRead(userId: string) {
    await this.notifications.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );
    return { updated: true };
  }

  async getUserNotificationSettings(user: AuthUser) {
    return this.notificationSettingsService.getSettings(user);
  }

  async updateUserNotificationSettings(
    user: AuthUser,
    dto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationSettingsService.updateSettings(user, dto);
  }
}
