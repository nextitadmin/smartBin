import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import {
  FacilityManager,
  FacilityManagerSchema,
} from '@models/users/facility-manager.model';
import { Bill, BillSchema } from '@models/bill.model';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { DashboardService } from './dashboard.service';
import { ResidentService } from '@src/resident/resident.service';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';
import { CorporateModule } from '@src/corporate/corporate.module';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { DashboardController } from './dashboard.controller';
import { CorporateService } from '@src/corporate/corporate.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Corporate.name, schema: CorporateSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Bill.name, schema: BillSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: SmartBin.name, schema: SmartBinSchema },
      { name: Payer.name, schema: PayerSchema },
      { name: UserKyc.name, schema: UserKycSchema }
    ]),
    SmartBinModule,
    CorporateModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, ResidentService, CorporateService],
})
export class DashboardModule {}
