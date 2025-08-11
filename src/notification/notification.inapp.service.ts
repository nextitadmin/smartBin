import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../models/notification';
import { SendInAppEventData } from './dto/event';

@Injectable()
export class NotificationInAppService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }

    async create(data: SendInAppEventData) {
        return this.notificationModel.create({
            ...data,
            isRead: data.isRead ?? false,
            createdAt: new Date()
        });
    }

    async getUserNotifications(userId: string) {
        return this.notificationModel.find({ userId }).sort({ createdAt: -1 });
    }

    async markAsRead(notificationId: string, userId: string) {
        const res = await this.notificationModel.findOneAndUpdate(
            { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
            { $set: { read: true } },
            { new: true },
        ).lean();
        if (!res) throw new NotFoundException('Notification not found');
        return res;
    }

    async markAllRead(userId: string) {
        await this.notificationModel.updateMany({ userId: new Types.ObjectId(userId), read: false }, { $set: { read: true } });
        return { updated: true };
    }
}
