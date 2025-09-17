import { Module } from '@nestjs/common';
import { PspController } from './psp.controller';
import { PspService } from './psp.service';
import { PSP, PSPSchema } from '@models/psp.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PSPMembers, PSPMembersSchema } from '@models/psp-members.model';

@Module({
  controllers: [PspController],
  providers: [PspService],
  imports: [
    MongooseModule.forFeature([
      { name: PSP.name, schema: PSPSchema },
      { name: PSPMembers.name, schema: PSPMembersSchema },
    ]),
  ],
})
export class PspModule {}
