import { Module } from '@nestjs/common';
import { SmartbinsController } from './smartbins.controller';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
import { ResidentModule } from '@src/resident/resident.module';
import { CorporateModule } from '@src/corporate/corporate.module';
import { AgentModule } from '@src/agent/agent.module';
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
import { Facility, FacilitySchema } from '@models/facilities';
import { LawmaSmartbinsService } from './smartbins.service';

@Module({
  imports: [
    SmartBinModule,
    FacilityManagerModule,
    ResidentModule,
    CorporateModule,
    AgentModule,
    // MongooseModule.forFeature([
    //   { name: SmartBin.name, schema: SmartBinSchema },
    //   { name: Resident.name, schema: ResidentSchema },
    //   { name: Agent.name, schema: AgentSchema },
    //   { name: Corporate.name, schema: CorporateSchema },
    //   { name: FacilityManager.name, schema: FacilityManagerSchema },
    //   { name: Bill.name, schema: BillSchema },
    //   { name: Wallet.name, schema: WalletSchema },
    //   { name: Transaction.name, schema: TransactionSchema },
    //   { name: Facility.name, schema: FacilitySchema },
    // ]),
  ],
  controllers: [SmartbinsController],
  providers: [LawmaSmartbinsService],
})
export class LawmaSmartbinsModule {}
