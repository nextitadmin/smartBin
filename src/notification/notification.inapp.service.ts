import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../models/notification';

@Injectable()
export class NotificationInAppService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }

    async createNotification(payload: {
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
        meta?: Record<string, any>;
    }) {
        const doc = await this.notificationModel.create({
            userId: new Types.ObjectId(payload.userId),
            title: payload.title,
            message: payload.message,
            type: payload.type,
            meta: payload.meta || {},
            read: false,
        });

        return doc.toObject();
    }

    async getNotifications(userId: string, page = 1, limit = 20) {
        const query = { userId: new Types.ObjectId(userId) };
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.notificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.notificationModel.countDocuments(query),
        ]);
        return {
            data: items,
            paging: { total, page, pages: Math.ceil(total / limit), size: items.length },
        };
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
