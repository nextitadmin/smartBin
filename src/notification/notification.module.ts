import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailerService } from './mailer.service';
import { NotificationSettingsService } from './notification-setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSettings, NotificationSettingsSchema } from '@models/notification.setting';
import { NotificationInAppService } from './notification.inapp.service';


import { Notification, NotificationSchema } from '../models/notification'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
      { name: Notification.name, schema: NotificationSchema },
    ])
  ],
  providers: [NotificationService, MailerService, NotificationSettingsService, NotificationInAppService],
  exports: [MailerService, NotificationInAppService, NotificationSettingsService],
})
export class NotificationModule { }
