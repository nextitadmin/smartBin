import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ResidentWalletController } from './resident.wallet.controller';
import { FacilityWalletController } from './facilityM.wallet.controller';
import { CorporateWalletController } from './corporate.wallet.controller';
import { AgentController } from '@src/agent/agent.controller';
import { Wallet, WalletSchema } from '../models/wallet.model';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { TransactionService } from '@src/transaction/transaction.service';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { AgentService } from '@src/agent/agent.service';
import { ResidentService } from '@src/resident/resident.service';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { FacilityManagerService } from '@src/facility-manager/facility-manager.service';
import { CorporateService } from '@src/corporate/corporate.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Payer.name, schema: PayerSchema },
      { name: Corporate.name, schema: CorporateSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema }

    ])
  ],
  providers: [WalletService, TransactionService, ResidentService, CorporateService, FacilityManagerService, AgentService],
  controllers: [ResidentWalletController, FacilityWalletController, AgentController, CorporateWalletController],
  exports: [WalletService],
})
export class WalletModule { }
