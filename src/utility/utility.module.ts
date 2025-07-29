import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';

@Module({
  controllers: [UtilityController]
})
export class UtilityModule {}
