import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { NotificationModule } from '@src/notification/notification.module';

@Module({
    controllers: [SupportController],
    imports: [NotificationModule],
    providers: [SupportService],

})
export class SupportModule { }
