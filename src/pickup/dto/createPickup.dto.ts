import { UserRole } from '@models/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CreatePickupDto {
  userId: string;
  userType: string;
  location:string;
  description:string;
 
  @ApiProperty()
  @IsString()
  branch: string;

  @ApiProperty()
  @IsDateString()
  pickupDate: string;

  @ApiProperty()
  @IsString()
  pickupTime: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  address: string;

  accountId: string;
  accountType: UserRole;
}

export class CreatePickupResponseDto {
  readonly date: Date;
  readonly address: string;
  readonly representative?: string;
  readonly customerName?: string;
  readonly branch?: string;
  readonly nextPickupDate?: Date;
  readonly agentNote?: string;
  readonly status: string; // Assuming status is a string, adjust if it's an enum
}
