import { Status } from '@models/pickup';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString , IsOptional} from 'class-validator';

export class RequestPickupDto {
  @ApiProperty()
  @IsDateString()
  pickupDateTime: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  note: string;
}


export class GetPickupDto{
  @ApiProperty()
 @IsOptional()
  status?: Status;

  @ApiProperty()
  @IsOptional()
  search?: string;


}