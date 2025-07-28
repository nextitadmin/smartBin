import { forwardRef, Module } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { CorporateWalletController } from './corporate-wallet.controller';
import { WalletModule } from '@src/wallet/wallet.module';
import { TransactionService } from '@src/transaction/transaction.service';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Bill, BillSchema } from '@models/bill.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { SmartBinController } from './smart-bin/smart-bin.controller';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Corporate.name, schema: CorporateSchema },
      { name: Payer.name, schema: PayerSchema },
      { name: SmartBin.name, schema: SmartBinSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      { name: Bill.name, schema: BillSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: UserKyc.name, schema: UserKycSchema }
    ]),
    forwardRef(() => WalletModule),
  ],
  controllers: [CorporateController, CorporateWalletController, SmartBinController],
  providers: [CorporateService, TransactionService, SmartBinService],
  exports: [CorporateService],
})
export class CorporateModule {}
