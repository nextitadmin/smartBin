import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Put, Body } from "@nestjs/common";
import { CorporateAuth } from "@common/decorators/auth.decorator";
import { AuthenticatedCorporate } from "@common/decorators/auth.decorator";
import { CorporateUser } from "@common/types";
import { NotificationSettingsService } from "@src/notification/notification-setting.service";
import { SuccessResponse } from '@common/http';
import { UpdateNotificationSettingsDto } from "@src/notification/dto/notifification-settings.dto";
import { UserRole } from "@models/types";



@ApiTags('Corporate Notification Settings')
@Controller({
    path: 'corporates/notification-settings',
    version: '1',
})
@CorporateAuth()
export class CorporateNotificationSettingsController {
    constructor(private readonly settingsService: NotificationSettingsService) { }

    @Get()
    async getCorporateSettings(
        @AuthenticatedCorporate() corporate: CorporateUser
    ) {
        const settings = await this.settingsService.getSettings(
            corporate.id,
            UserRole.Corporate
        );
        return new SuccessResponse('Notification settings retrieved', settings);
    }

    @Put('settings')
    async updateCorporateSettings(
        @AuthenticatedCorporate() corporate: CorporateUser,
        @Body() dto: UpdateNotificationSettingsDto
    ) {
        const updated = await this.settingsService.updateSettings(
            corporate.id,
            UserRole.Corporate,
            dto
        );
        return new SuccessResponse('Notification settings updated', updated);
    }
}
