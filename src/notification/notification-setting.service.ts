import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SuccessResponse } from '@common/http';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationSettings } from '@models/notification-setting.model';
import { UpdateNotificationSettingsDto } from './dto/notifification-settings.dto';
import { UserRole } from '@models/types';
import { AuthUser } from '@common/types';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectModel(NotificationSettings.name)
    private settingModel: Model<NotificationSettings>,
  ) {}

  //    async getSettings(userId: string, userType: UserRole) {
  //   const settings = await this.settingModel.findOne({ userId, userType }).lean();
  //   return  new SuccessResponse('Notification settings retrieved', settings ?? null);
  // }

  async getSettings(user: AuthUser) {
    const settings = await this.settingModel
      .findOne({ userId: user.id })
      .lean();

    const defaultSettings = {
      userId: user.id,
      userType: user.role,
      sms: true,
      email: true,
      inApp: true,
      appUpdates: true,
      smartBinUpdates: true,
      lowWalletBalance: true,
    };

    return new SuccessResponse(
      'Notification settings retrieved',
      settings ?? defaultSettings,
    );
  }

  async updateSettings(user: AuthUser, dto: UpdateNotificationSettingsDto) {
    return await this.settingModel.findOneAndUpdate(
      { userId: user.id, userType: user.role },
      { $set: dto },
      { new: true, upsert: true },
    );
  }
}
