import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SmartBinApplicationStatus } from '@src/models/types/index';

export class UpdateSmartBinStatusDto {
    @ApiProperty({
        enum: SmartBinApplicationStatus,
        example: SmartBinApplicationStatus.Pending,
    })
    @IsEnum(SmartBinApplicationStatus)
    @IsNotEmpty()
    status: SmartBinApplicationStatus;
}
