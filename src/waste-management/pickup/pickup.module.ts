import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import {
  FacilityManager,
  FacilityManagerSchema,
} from '@models/users/facility-manager.model';
import { Bill, BillSchema } from '@models/bill.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { PickupService } from './pickup.service';
import { Pickup, PickupSchema } from '@models/pickup';
import { AgentModule } from '@src/agent/agent.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pickup.name, schema: PickupSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [PickupService],
  exports: [PickupService],
  controllers: [],
})
export class PickupModule {}
