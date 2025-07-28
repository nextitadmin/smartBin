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
import { CorporateModule } from '@src/corporate/corporate.module';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { FacilityManagerService } from '@src/facility-manager/facility-manager.service';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bill.name, schema: BillSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Payer.name, schema: PayerSchema },
      { name: SmartBin.name, schema: SmartBinSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      { name: UserKyc.name, schema: UserKycSchema }
    ]),
    SmartBinModule,
    CorporateModule,
  ],
  controllers: [
    ResidentBillController,
    CorporateBillController,
    FacilityBillController,
  ],
  providers: [BillService, ResidentService, FacilityManagerService],
})
export class BillModule {}
