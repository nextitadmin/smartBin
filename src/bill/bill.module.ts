import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { ResidentBillController } from './resident.bill.controller';
import { CorporateBillController } from './corporate.bill.controller';
import { FacilityBillController } from './facilityM.bill.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from '@models/bill.model';
import { Wallet, WalletSchema } from '@models/wallet.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bill.name, schema: BillSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
  ],
  controllers: [ResidentBillController, CorporateBillController, FacilityBillController],
  providers: [BillService],
})
export class BillModule { }
