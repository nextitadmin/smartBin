import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailerService } from './mailer.service';

@Module({
  providers: [NotificationService, MailerService],
  exports: [MailerService],
})
export class NotificationModule {}
