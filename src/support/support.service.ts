import { Injectable } from '@nestjs/common';
import { CreateSupportRequestDto } from './dtos/support-request.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    MailNotificationEvents,
    SendEmailEvent,
} from '@src/notification/dto/event';

@Injectable()
export class SupportService {
    constructor(
        private readonly ee: EventEmitter2,
    ) { }

    async sendMailToSupport(dto: CreateSupportRequestDto, file?: Express.Multer.File) {
        const { fullName, phoneNumber, email, message } = dto;

        const eventPayload = new SendEmailEvent({
            to: 'harbike88@gmail.com',
            from: '"LAWMA Support" <no-reply@lawma.gov.ng>',
            subject: `New Support Request from ${fullName}`,
            context: { fullName, phoneNumber, email, message },
            replyTo: email,
        });
        this.ee.emit(MailNotificationEvents.Support.NewRequest, eventPayload, file);

        return { message: 'Your message has been sent successfully!' };
    }
}
