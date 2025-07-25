import { Module } from '@nestjs/common';
import { mongodbConfigOptions } from './config/mongo.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigAttributes, configModuleOpts } from './config';
import { NotificationModule } from './notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigOpts } from './config/jwt.config';
import { LoggerModule } from 'nestjs-pino';
import { loggerModuleOpts } from './config/logger.config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { CacheModule } from '@nestjs/cache-manager';
import { cacheModuleConfigOpts } from './config/cache.config';
import { exec } from 'child_process';
import { WalletModule } from './wallet/wallet.module';
import { PaymentModule } from './payment/payment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from './transaction/transaction.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AgentModule } from './agent/agent.module';
import { PayerModule } from './payer/payer.module';
import { BillModule } from './bill/bill.module';
import { AppController } from './app.controller';
import { DashboardModule } from './dashboard/dashboard.module';
import { SmartBinModule } from './smart-bin/smart-bin.module';
import { ResidentModule } from './resident/resident.module';

import { APP_GUARD } from '@nestjs/core';
import { AgentAuthGuard } from '@common/guards/agent.guard';
import { ResidentAuthGuard } from '@common/guards/resident.guard';
import { CorporateAuthGuard } from '@common/guards/corporate.guard';
import { FacilityManagerAuthGuard } from '@common/guards/facility-manager.guard';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOpts),
    LoggerModule.forRootAsync(loggerModuleOpts),
    MongooseModule.forRootAsync(mongodbConfigOptions),
    JwtModule.registerAsync(jwtConfigOpts),
    CacheModule.registerAsync(cacheModuleConfigOpts),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    HttpModule,
    // AuthenticationModule,
    NotificationModule,
    WalletModule,
    PaymentModule,
    // WebhookModule,
    TransactionModule,
    // VerificationModule,
    AgentModule,
    // CorporateModule,
    PayerModule,
    ResidentModule,
    // FacilityManagerModule,
    BillModule,
    DashboardModule,
    SmartBinModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useValue: AgentAuthGuard,
    },
    {
      provide: APP_GUARD,
      useValue: ResidentAuthGuard,
    },
    {
      provide: APP_GUARD,
      useValue: CorporateAuthGuard,
    },
    {
      provide: APP_GUARD,
      useValue: FacilityManagerAuthGuard,
    },
  ],
})
export class AppModule {
  onApplicationBootstrap() {
    exec('yarn run copy:assets');
  }
}
