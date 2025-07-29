import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailerService } from './mailer.service';
import { NotificationSettingsService } from './notification-setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSettings, NotificationSettingsSchema } from '@models/notification.setting';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationSettings.name, schema: NotificationSettingsSchema }
    ])
  ],
  providers: [NotificationService, MailerService, NotificationSettingsService],
  exports: [MailerService, NotificationSettingsService],
})
export class NotificationModule { }
