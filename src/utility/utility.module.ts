import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Lga, LgaSchema } from '@models/lgas.model';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Lga.name, schema: LgaSchema }
  ])],
  controllers: [UtilityController],
  providers: [UtilityService],
})
export class UtilityModule { }
