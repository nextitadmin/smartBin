import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wallet } from '../models/wallet.model';
import { Customer } from '../models/customer.model';

@Module({
  imports: [SequelizeModule.forFeature([Wallet, Customer])],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
