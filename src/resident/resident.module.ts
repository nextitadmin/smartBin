import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { ResidentService } from './resident.service';
import { ResidentController } from './resident.controller';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model'
import { Bill, BillSchema } from '@models/bill.model'
import { Wallet, WalletSchema } from '@models/wallet.model'
import { Transaction, TransactionSchema } from '@models/transaction.model'
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { KycApplicationController } from './kyc-application/kyc-application.controller';
import { KycModule } from '@src/kyc/kyc.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Resident.name,
        schema: ResidentSchema,
      },
      {
        name: Payer.name,
        schema: PayerSchema,
      },
      {
        name: SmartBin.name,
        schema: SmartBinSchema
      },
      {
        name: Agent.name,
        schema: AgentSchema
      },
      {
        name: Corporate.name,
        schema: CorporateSchema
      },
      {
        name: FacilityManager.name,
        schema: FacilityManagerSchema
      },
      {
        name: Bill.name,
        schema: BillSchema
      },
      {
        name: Wallet.name,
        schema: WalletSchema
      },
      {
        name: Transaction.name,
        schema: TransactionSchema
      },
      { name: UserKyc.name, schema: UserKycSchema }
    ]),
    SmartBinModule,
    KycModule
  ],
  controllers: [ResidentController, KycApplicationController],
  exports: [ResidentService, SmartBinService],
  providers: [ResidentService, SmartBinService],
})
export class ResidentModule { }
