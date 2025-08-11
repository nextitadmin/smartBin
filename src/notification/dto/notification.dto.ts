import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SmartBinApplicationStatus } from '@src/models/types/index';
import e from 'express';

export class UpdateSmartBinStatusDto {
  @ApiProperty({
    enum: SmartBinApplicationStatus,
    example: SmartBinApplicationStatus.Pending,
  })
  @IsEnum(SmartBinApplicationStatus)
  @IsNotEmpty()
  status: SmartBinApplicationStatus;
}

export class UpdateNotificationDto {
  @ApiProperty({})
  @IsBoolean()
  isRead: boolean;
}

export class QueryNotificationDto {
  @ApiProperty({
    description: 'Filter notifications by read status',
    example: 'true',
  })
  @IsOptional()
  isRead: string;
}
