import { forwardRef, Module } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { CorporateWalletController } from './corporate-wallet.controller';
import { WalletModule } from '@src/wallet/wallet.module';
import { TransactionService } from '@src/transaction/transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Corporate.name, schema: CorporateSchema },
    ]),
    forwardRef(() => WalletModule),
  ],
  controllers: [CorporateController, CorporateWalletController],
  providers: [CorporateService, TransactionService],
  exports: [CorporateService],
})
export class CorporateModule {}
