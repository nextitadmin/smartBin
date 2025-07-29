import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEmail,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class NipTransactionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  requestdate: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  nibssresponse: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  sendstatus: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  sendresponse: string | null;

  @ApiProperty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsString()
  transactionStatus: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  log: string | null;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsBoolean()
  isCallbackValidated: boolean;

  @ApiProperty()
  @IsString()
  originatoraccountnumber: string;

  @ApiProperty()
  @IsString()
  originatorname: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  bankname: string | null;

  @ApiProperty()
  @IsString()
  bankcode: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  narration: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  craccountname: string | null;

  @ApiProperty()
  @IsString()
  craccount: string;

  @ApiProperty()
  @IsString()
  paymentreference: string;

  @ApiProperty()
  @IsString()
  sessionid: string;
}

class VirtualAccountDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  merchantId: string;

  @ApiProperty()
  @IsString()
  virtualBankCode: string;

  @ApiProperty()
  @IsString()
  virtualBankAccountNumber: string;

  @ApiProperty()
  @IsString()
  businessBankAccountNumber: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  businessBankCode: string | null;

  @ApiProperty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsDateString()
  expiredAt: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  settlementType: string | null;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsString()
  businessId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  subBusinessCode: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  customer: any;
}

class CustomerDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  metadata: string;
}

export class PaymentNotificationDTO {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty()
  @IsNumber()
  paymentMethodId: number;

  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsBoolean()
  isAmountDiscrepant: boolean;

  @ApiProperty()
  @IsNumber()
  amountSent: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => NipTransactionDto)
  nipTransaction: NipTransactionDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => VirtualAccountDto)
  virtualAccount: VirtualAccountDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  subBusinessCode: string | null;

  @ApiProperty()
  @IsBoolean()
  isCallbackValidated: boolean;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  merchantId: string;

  @ApiProperty()
  @IsString()
  businessId: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  channel: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  callbackUrl: string | null;

  @ApiProperty()
  @IsNumber()
  feeAmount: number;

  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  statusReason: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  settlementType: string | null;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsDateString()
  updatedAt: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  ngnVirtualBankAccountNumber: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  ngnVirtualBankCode: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  usdVirtualAccountNumber: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  usdVirtualBankCode: string | null;
}
