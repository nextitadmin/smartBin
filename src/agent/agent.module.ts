import { forwardRef, Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { AgentWalletController } from './agent-wallet.controller';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { WalletService } from '@src/wallet/wallet.service';
import { WalletModule } from '@src/wallet/wallet.module';
import { TransactionService } from '@src/transaction/transaction.service';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { TransactionModule } from '@src/transaction/transaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Agent.name,
        schema: AgentSchema,
      },
      {
        name: Payer.name,
        schema: PayerSchema,
      },
      {
        name: Wallet.name,
        schema: WalletSchema,
      },
      {
        name: UserKyc.name,
        schema: UserKycSchema,
      },
    ]),
    forwardRef(() => WalletModule),
    forwardRef(() => TransactionModule),
  ],
  providers: [AgentService, WalletService],
  exports: [AgentService],
  controllers: [AgentController, AgentWalletController],
})
export class AgentModule {}
