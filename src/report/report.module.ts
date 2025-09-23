import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from '@models/report.model';
import { ReportService } from './report.service';
import { CorporateReportController } from '@src/corporate/report.controller';
import { Bill, BillSchema } from '@models/bill.model';
import { CorporateSchema, Corporate } from '@models/users/corporate.model';
import { CorporateModule } from '@src/corporate/corporate.module';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Pickup, PickupSchema } from '@models/pickup';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { FacilityUsers, FacilityUserSchema } from '@models/facility-users.model';
import { AdminReportController } from '../lawma/admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Corporate.name, schema: CorporateSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      // {name:FacilityUsers.name,schema:FacilityUserSchema}
      { name: Bill.name, schema: BillSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: SmartBin.name, schema: SmartBinSchema },
      { name: Pickup.name, schema: PickupSchema },
    ]),
    CorporateModule,
  ],
  controllers: [CorporateReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule { }
