import { Module } from '@nestjs/common';
import { SuperadminsModule } from './superadmins/superadmins.module';
import { PspModule } from './psp/psp.module';
import { UsersModule as LawmaUserManagementModule } from './user-management/user-management.module';
import { LawmaSmartbinsModule } from './smartbins/smartbins.module';

@Module({
  imports: [
    SuperadminsModule,
    PspModule,
    LawmaUserManagementModule,
    LawmaSmartbinsModule,
  ],
})
export class LawmaModule {}
