import { Verification, VerificationSchema } from '@models/verification.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationService } from './verification.service';
import { Beneficiary, BeneficiarySchema } from '@models/beneficiary.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Verification.name,
        schema: VerificationSchema,
      },
      {
        name: Beneficiary.name,
        schema: BeneficiarySchema,
      },
    ]),
  ],
  providers: [VerificationService],
})
export class VerificationModule {}
