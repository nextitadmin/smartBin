import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  QueryNotificationDto,
  UpdateNotificationDto,
} from './dto/notification.dto';
import { SuccessResponse } from '@common/http';
import { Auth, AuthenticatedUser } from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { UpdateNotificationSettingsDto } from './dto/notifification-settings.dto';

@ApiTags('Notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
@Auth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @AuthenticatedUser() user: AuthUser,
    @Query() query: QueryNotificationDto,
  ) {
    const notification = await this.notificationService.getUserNotifications(
      user.id,
    );
    return new SuccessResponse('Notifications retrieved', notification);
  }

  @Get('/settings')
  async getUserNotificationSettings(@AuthenticatedUser() user: AuthUser) {
    const settings = await this.notificationService.getUserNotificationSettings(
      user,
    );
    return new SuccessResponse('Notification settings retrieved', settings);
  }

  @Put('/settings')
  async updateUserNotificationSettings(
    @AuthenticatedUser() user: AuthUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const updated =
      await this.notificationService.updateUserNotificationSettings(user, dto);
    return new SuccessResponse('Notification settings updated', updated);
  }

  @ApiParam({
    name: 'id',
    description: 'The ID of the notification to update',
    example: '60c72b2f9b1e8d3f4c8b4567',
  })
  @Patch(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const notificationUpdatte =
      await this.notificationService.updateNotification({
        id,
        ...updateNotificationDto,
      });

    return new SuccessResponse('Notification updated successfully', null);
  }

  @Patch('/read-all')
  async markAllNotificationsAsRead(@AuthenticatedUser() user: AuthUser) {
    const updated = await this.notificationService.markAllRead(user.id);
    return new SuccessResponse('All notifications marked as read', updated);
  }
}
