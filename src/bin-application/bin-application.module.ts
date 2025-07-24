import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Resident, ResidentSchema  } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { Bill, BillSchema } from '@models/bill.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { BinApplicationController } from './bin-application.controller';
import { BinApplicationService } from './bin-application.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SmartBin.name, schema: SmartBinSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Corporate.name, schema: CorporateSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      { name: Bill.name, schema: BillSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema }
    ])
  ],
  controllers: [BinApplicationController],
  providers: [BinApplicationService]
})
export class BinApplicationModule {}
