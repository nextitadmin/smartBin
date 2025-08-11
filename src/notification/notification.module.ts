import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailerService } from './mailer.service';
import { NotificationSettingsService } from './notification-setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NotificationSettings,
  NotificationSettingsSchema,
} from '@models/notification-setting.model';

import { Notification, NotificationSchema } from '../models/notification.model';
import { NotificationController } from './notification.controller';
import { ResidentModule } from '@src/resident/resident.module';
import { AgentModule } from '@src/agent/agent.module';
import { CorporateModule } from '@src/corporate/corporate.module';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    ResidentModule,
    AgentModule,
    CorporateModule,
    FacilityManagerModule,
  ],
  providers: [NotificationService, MailerService, NotificationSettingsService],
  exports: [MailerService, NotificationSettingsService],
  controllers: [NotificationController],
})
export class NotificationModule {}
