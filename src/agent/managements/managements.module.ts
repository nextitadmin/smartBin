import { forwardRef, Module } from '@nestjs/common';
import { CorporatesManagementController } from './corporates-management/corporates-management.controller';
import { ResidentsManagementController } from './residents-management/residents-management.controller';
import { CorporatesManagementService } from './corporates-management/corporates-management.service';
import { ResidentsManagementService } from './residents-management/residents-management.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { Branch, BranchSchema } from '@models/branch.model';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { AgentModule } from '../agent.module';
import { ManagementController } from './managements.controller';
import { ManagementService } from './managements.service';

@Module({
  imports: [
    forwardRef(() => AgentModule),
    MongooseModule.forFeature([
      {
        name: Corporate.name,
        schema: CorporateSchema,
      },
      {
        name: Branch.name,
        schema: BranchSchema,
      },
      {
        name: Resident.name,
        schema: ResidentSchema,
      },
    ]),
  ],
  controllers: [CorporatesManagementController, ResidentsManagementController, ManagementController],
  providers: [CorporatesManagementService, ResidentsManagementService, ManagementService ],
  exports: [CorporatesManagementService, ResidentsManagementService, ManagementService ],
})
export class ManagementsModule {}
