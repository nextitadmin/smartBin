import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { ResidentBillController } from './resident.bill.controller';
import { CorporateBillController } from './corporate.bill.controller';
import { FacilityBillController } from './facilityM.bill.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from '@models/bill.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { ResidentService } from '@src/resident/resident.service';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bill.name, schema: BillSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Resident.name, schema: ResidentSchema},
      { name:Payer.name, schema: PayerSchema}
    ]),
    SmartBinModule
  ],
  controllers: [ResidentBillController, CorporateBillController, FacilityBillController],
  providers: [BillService, ResidentService],
})
export class BillModule { }
