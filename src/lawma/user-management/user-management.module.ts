// 
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './user-management.service';
import { UsersController } from './user-management.controller';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Corporate, CorporateSchema } from '@models/users/corporate.model';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';
import { ResidentService } from '@src/resident/resident.service';
import { FacilityManagerService } from '@src/facility-manager/facility-manager.service';
import { AgentService } from '@src/agent/agent.service';
import { CorporateService } from '@src/corporate/corporate.service';
import { SubscriptionService } from '@src/subscription/subscription.service';
import { Subscription, SubscriptionSchema } from '@models/subscription.model';
import { ResidentModule } from '@src/resident/resident.module';
import { AgentModule } from '@src/agent/agent.module';
import { CorporateModule } from '@src/corporate/corporate.module';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
import { SubscriptionModule } from '@src/subscription/subscription.module';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { FacilityUsers, FacilityUserSchema } from '@models/facility-users.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Resident.name, schema: ResidentSchema },
            { name: Agent.name, schema: AgentSchema },
            { name: Corporate.name, schema: CorporateSchema },
            { name: FacilityManager.name, schema: FacilityManagerSchema },
            { name: FacilityUsers.name, schema: FacilityUserSchema },
            { name: Subscription.name, schema: SubscriptionSchema },
            { name: UserKyc.name, schema: UserKycSchema }
        ]),
        ResidentModule,
        AgentModule,
        CorporateModule,
        FacilityManagerModule,
        SubscriptionModule,
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
