import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { Bill, BillSchema } from '@models/bill.model';
import { Pickup, PickupSchema } from '@models/pickup';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { TeamMember, TeamMemberSchema } from '@models/team.model';
import { PSP, PSPSchema } from '@models/psp.model';
import { Lga, LgaSchema } from '@models/lgas.model';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Resident.name, schema: ResidentSchema },
        { name: Agent.name, schema: AgentSchema },
        { name: Corporate.name, schema: CorporateSchema },
        { name: FacilityManager.name, schema: FacilityManagerSchema },
        { name: Wallet.name, schema: WalletSchema },
        { name: Bill.name, schema: BillSchema },
        { name: Pickup.name, schema: PickupSchema },
        { name: Transaction.name, schema: TransactionSchema },
        { name: SmartBin.name, schema: SmartBinSchema },
        { name: Payer.name, schema: PayerSchema },
        { name: UserKyc.name, schema: UserKycSchema },
        { name: TeamMember.name, schema: TeamMemberSchema },
        { name: PSP.name, schema: PSPSchema },
        { name: Lga.name, schema: LgaSchema}
      ]),
    ],
  controllers: [],
  providers: [SuperAdminService],
  exports: [SuperAdminService]
})
export class SuperAdminModule {}
