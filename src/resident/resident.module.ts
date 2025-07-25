import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { ResidentService } from './resident.service';
import { ResidentController } from './resident.controller';



@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Resident.name,
        schema: ResidentSchema,
      },
      {
        name: Payer.name,
        schema: PayerSchema,
      },
    ]),
  ],
  controllers: [ResidentController],
  exports: [ResidentService],
  providers: [ResidentService],
})
export class ResidentModule { }
