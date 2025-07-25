import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailNotificationEvents, SendEmailEvent, Templates } from './dto/event';
import { MailerService } from './mailer.service';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(MailNotificationEvents.Account.PayerGenerated)
  async onAccountPayerGenerated(event: SendEmailEvent) {
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.PayerGenerated,
      to,
      context,
      subject,
    });
  }

  @OnEvent(MailNotificationEvents.Account.Welcome)
  async onAccountWelcome(event: SendEmailEvent) {
    console.log('dfefs');
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.Welcome,
      to,
      context,
      subject,
    });
  }

  @OnEvent(MailNotificationEvents.Account.ForgotPassword)
  async onAccountReset(event: SendEmailEvent) {
    console.log('received envet');
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.ForgotPassword,
      to,
      context,
      subject,
    });
  }

  @OnEvent(MailNotificationEvents.Account.VerificationOTP)
  async onAccountOTPRequested(event: SendEmailEvent) {
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.VerifyOTP,
      to,
      context,
      subject,
    });
  }

  // @OnEvent(MailNotificationEvents.Account.VerificationOTP)
  // async onAccountOTPRequested(event: SendEmailEvent) {
  //   const { from, context, to, subject } = event.data;
  //   await this.mailerService.sendMail({
  //     from,
  //     template: Templates.VerifyOTP,
  //     to,
  //     context,
  //     subject,
  //   });
  // }
}
