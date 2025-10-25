import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
// import { RbacController } from './rbac.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '@models/role.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Role.name,
        schema: RoleSchema,
      },
    ]),
  ],
  providers: [RbacService],
  exports: [RbacService],
  // controllers: [RbacController],
})
export class RbacModule {}
