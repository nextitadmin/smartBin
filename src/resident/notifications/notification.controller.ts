// import { ApiTags } from '@nestjs/swagger';
// import { Controller, Get, Put, Body, Patch, Param } from '@nestjs/common';
// import {
//   AuthenticatedResident,
//   ResidentAuth,
// } from '@common/decorators/auth.decorator';
// import { ResidentUser } from '@common/types';
// import { ReportService } from '@src/report/report.service';
// import { NotificationSettingsService } from '@src/notification/notification-setting.service';
// import { SuccessResponse } from '@common/http';
// import { UpdateNotificationSettingsDto } from '@src/notification/dto/notifification-settings.dto';
// import { UserRole } from '@models/types';
// import { NotificationService } from '@src/notification/notification.service';

// @ApiTags('Resident Notifications')
// @Controller({
//   path: 'residents/notification-settings',
//   version: '1',
// })
// @ResidentAuth()
// export class ResidentotificationSettingsController {
//   constructor(private readonly settingsService: NotificationSettingsService) {}

//   @Get()
//   async getResidentSettings(@AuthenticatedResident() resident: ResidentUser) {
//     const settings = await this.settingsService.getSettings(
//       resident.id,
//       UserRole.Resident,
//     );
//     return new SuccessResponse('Notification settings retrieved', settings);
//   }

//   @Put('settings')
//   async updateResidentSettings(
//     @AuthenticatedResident() resident: ResidentUser,
//     @Body() dto: UpdateNotificationSettingsDto,
//   ) {
//     const updated = await this.settingsService.updateSettings(
//       resident.id,
//       UserRole.Resident,
//       dto,
//     );
//     return new SuccessResponse('Notification settings updated', updated);
//   }

//   @Get('notifications')
//   async getResidentNotifications(
//     @AuthenticatedResident() resident: ResidentUser,
//   ) {
//     const notifications = await this.notificationService.getUserNotifications(
//       resident.id,
//     );
//     return new SuccessResponse('Notifications retrieved', notifications);
//   }

//   @Patch(':id/read')
//   async markAsRead(
//     @Param('id') notificationId: string,
//     @AuthenticatedResident() resident: ResidentUser,
//   ) {
//     return this.notificationService.markAsRead(notificationId, resident.id);
//   }
// }
