import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionWorker } from './transaction.worker';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PayerModule } from '@src/payer/payer.module';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';


@Module({
  imports: [
    // CustomerModule,
    // ProvidersModule,
    // WalletModule,
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
      { name: Resident.name, schema: ResidentSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Corporate.name, schema: CorporateSchema }
      //     {
      //       name: Wallet.name,
      //       schema: WalletSchema,
      //     },
      //     {
      //       name: Commission.name,
      //       schema: CommissionSchema,
      //     },
    ]),
    forwardRef(() => PayerModule),
  ],
  providers: [TransactionService, TransactionWorker],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule { }
