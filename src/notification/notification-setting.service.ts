import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SuccessResponse } from '@common/http';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationSettings } from '@models/notification.setting';
import { UpdateNotificationSettingsDto } from './dto/notifification-settings.dto';
import { UserRole } from '@models/types';


@Injectable()
export class NotificationSettingsService {
    constructor(
        @InjectModel(NotificationSettings.name)
        private settingModel: Model<NotificationSettings>
    ) { }

    async getSettings(userId: string, userType: UserRole) {
        return await this.settingModel.findOne({ userId, userType }).lean();
    }

    async updateSettings(
        userId: string,
        userType: UserRole,
        dto: UpdateNotificationSettingsDto
    ) {
        return await this.settingModel.findOneAndUpdate(
            { userId, userType },
            { $set: dto },
            { new: true, upsert: true }
        );
    }

}
