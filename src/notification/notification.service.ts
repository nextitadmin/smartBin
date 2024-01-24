import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun-js';
import { ConfigAttributes } from '../config';
import { OnEvent } from '@nestjs/event-emitter';
import { events } from '../common/constants';
import { SendEmailEvent } from './dto/event';

@Injectable()
export class NotificationService {
  private mg: Mailgun.Mailgun;

  constructor(private configService: ConfigService<ConfigAttributes>) {
    const apiKey = this.configService.get('mailgun.apiKey', { infer: true });
    const domain = this.configService.get('mailgun.domain', { infer: true });

    this.mg = Mailgun({
      apiKey,
      domain,
    });
  }

  @OnEvent(events.sendEmail)
  sendEmail(event: SendEmailEvent) {
    const { to, subject, html } = event.data;
    const mailFrom = this.configService.get('mailgun.fromName', {
      infer: true,
    });
    const mailFromEmail = this.configService.get('mailgun.fromEmail', {
      infer: true,
    });

    const data = {
      from: `${mailFrom} <${mailFromEmail}>`,
      to,
      subject,
      html,
    };

    this.mg.messages().send(data, function (error, body) {
      console.info('MAIL RESPONSE', { error }, { body });
    });
  }
}
