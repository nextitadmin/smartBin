
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    sms?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    email?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    inApp?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    appUpdates?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    smartBinUpdates?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    lowWalletBalance?: boolean;
}
