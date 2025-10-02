import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogController } from './auditLog.controller';
import { AuditLogService } from './auditLog.service';
import { AuditLog, AuditLogSchema } from '@models/audit-log.model';
import {
  Administrator,
  AdministratorSchema,
} from '@models/administrator.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Administrator.name, schema: AdministratorSchema },
    ]),
    AuthModule
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
