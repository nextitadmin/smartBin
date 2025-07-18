import { Module } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';

@Module({
  controllers: [CorporateController],
  providers: [CorporateService],
})
export class CorporateModule {}
