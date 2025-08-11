import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailNotificationEvents, SendEmailEvent, Templates, InAppNotificationEvents, SendInAppEvent } from './dto/event';
import { MailerService } from './mailer.service';
import { NotificationInAppService } from './notification.inapp.service';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService,
    private readonly notificationInAppService: NotificationInAppService,
  ) { }

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



  @OnEvent(MailNotificationEvents.Application.SmartBinUpdate)
  async onSmartBinUpdate(event: SendEmailEvent) {
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.SmartBinUpdate,
      to,
      context,
      subject,
    });
  }



  @OnEvent(MailNotificationEvents.Application.GeneralAppUpdate)
  async onAppUpdate(event: SendEmailEvent) {
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.GeneralAppUpdate,
      to,
      context,
      subject,
    });
  }




  @OnEvent(MailNotificationEvents.Application.LowWalletBalance)
  async onLowBalance(event: SendEmailEvent) {
    const { from, context, to, subject } = event.data;
    await this.mailerService.sendMail({
      from,
      template: Templates.LowWalletBalance,
      to,
      context,
      subject,
    });
  }

  @OnEvent(MailNotificationEvents.Support.NewRequest)
  async onSupportRequest(event: SendEmailEvent, file?: Express.Multer.File) {
    await this.mailerService.sendMail({
      to: event.data.to,
      from: event.data.from,
      subject: event.data.subject,
      context: event.data.context,
      template: Templates.SupportRequest,
      attachments: file
        ? [
          {
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
          },
        ]
        : [],
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

  @OnEvent(InAppNotificationEvents.SmartBinUpdate)
  async handleSmartBinUpdate(event: SendInAppEvent) {
    const { userId, email, subject, text, type } = event.data;
    await this.notificationInAppService.create({
      userId,
      text: text,
      type,
      isRead: false,
    });

    if (email) {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: Templates.SmartBinUpdate,
        context: { text },
      });
    }

    // @OnEvent(InAppNotificationEvents.GeneralAppUpdate)
    // async handleAppUpdate(event: SendInAppEvent) {
    //   await this.notificationInAppService.create(event.data);
    // }

    // @OnEvent(InAppNotificationEvents.LowWalletBalance)
    // async handleLowBalance(event: SendInAppEvent) {
    //   await this.notificationInAppService.create(event.data);
  }




}
