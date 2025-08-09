import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { NotificationInAppService } from '@src/notification/notification.inapp.service';
import { AuthenticatedResident } from '@common/decorators/auth.decorator'; // or other auth decorator
import { AuthUser } from '@common/types';
import { ApiTags } from "@nestjs/swagger";


@ApiTags('Resident Notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
    constructor(private readonly notif: NotificationInAppService) { }

    @Get()
    async list(@AuthenticatedResident() user: AuthUser, @Query('page') page = 1) {
        return await this.notif.getNotifications(user.id, page);
    }

    @Post(':id/read')
    async markRead(@AuthenticatedResident() user: AuthUser, @Param('id') id: string) {
        return await this.notif.markAsRead(id, user.id);
    }
}
