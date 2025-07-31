import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from '@models/report.model'
import { ReportService } from './report.service';
import { CorporateReportController } from '@src/corporate/report.controller';
import { Bill, BillSchema } from '@models/bill.model';
import { CorporateService } from '@src/corporate/corporate.service';
import { CorporateSchema, Corporate } from '@models/users/corporate.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { CorporateModule } from '@src/corporate/corporate.module';
import { SmartBin, SmartBinSchema } from '@models/smart-bin.model';
import { Pickup, PickupSchema } from '@models/pickup';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Report.name, schema: ReportSchema },
            { name: Bill.name, schema: BillSchema },
            { name: SmartBin.name, schema: SmartBinSchema },
            { name: Pickup.name, schema: PickupSchema }

        ]),
        CorporateModule
    ],
    controllers: [CorporateReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule { }
