import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';    
import { PaymentMethod,CustomerType, Status, } from '@models/pickup';

export interface PickupDto {
  _id: string;
  payerId: string;
  wasteId: string;
  firstName: string;
  lastName: string;
  email: string;
  date: Date;
  address: string;
  billReference?: string;
  description?: string;
  amount?: number;
  representative?: string;
  phoneNumber?: string;
  customerName?: string;
  branch?: string;
  nextPickupDate?: Date;
  residentLocation?: string;
  agentNote?: string;
  status?: string;
  paymentMethod?: string;
  time?: string;
  notification?: string;
  customerType?: string;
  issuedOn?: String;
  paymentDue?: String;
  location?: string 
  createdAt?: Date;
  updatedAt?: Date;
}

export class createPickupDto {
  @ApiProperty()
  @IsString()
  address: string;

 @ApiProperty()
  @IsString()
  @Prop({required: true })
  payerId   : string;

  @ApiProperty()
  @IsString()
  representative?: string;

  @ApiProperty()
  @IsEnum({ enum: Status, default: Status.Pending })
  status: string;

  @ApiProperty()
  @IsString()
  customerName?: string;

 @ApiProperty()
  @IsString()
  branch?: string;

  @ApiProperty()
  @IsString()
  nextPickupDate?: Date;

  @ApiProperty()
  @IsString()
  agentNote?: string; // Add agent-specific info here if needed

  @Prop({ required: true })
  wasteId: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @ApiProperty()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  residentLocation?: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  amount?: number;

  @ApiProperty()
  @IsString()
  billReference?: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.Wallet })
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty()
  @IsString()
  time?: string;

  @ApiProperty()
  @IsString()
  notification?: string;

  @ApiProperty()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @ApiProperty()
  @IsString()
  issuedOn?: String;

  @ApiProperty()
  @IsString()
  paymentDue?: String;

  @ApiProperty()
  @IsString()
  location?: string 
}