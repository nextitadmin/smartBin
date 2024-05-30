import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UtilityModule } from './utility/utility.module';
import { mongodbConfigOptions } from './config/mongo.config';
import { ConfigModule } from '@nestjs/config';
import { configModuleOpts } from './config';
import { NotificationModule } from './notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigOpts } from './config/jwt.config';
import { LoggerModule } from 'nestjs-pino';
import { loggerModuleOpts } from './config/logger.config';
import { CustomerModule } from './customer/customer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { CacheModule } from '@nestjs/cache-manager';
import { cacheModuleConfigOpts } from './config/cache.config';
import { exec } from 'child_process';
import { WalletModule } from './wallet/wallet.module';
import { PaymentModule } from './payment/payment.module';
import { KycModule } from './kyc/kyc.module';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';
import { WebhookModule } from './webhook/webhook.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProvidersModule } from './providers/providers.module';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from './transaction/transaction.module';
import { AirtimeDataModule } from './airtime-data/airtime-data.module';
import { VerificationModule } from './verification/verification.module';
import { ScheduleModule } from '@nestjs/schedule';

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
    AuthenticationModule,
    UtilityModule,
    NotificationModule,
    CustomerModule,
    WalletModule,
    PaymentModule,
    KycModule,
    FlutterwaveModule,
    WebhookModule,
    ProvidersModule,
    TransactionModule,
    AirtimeDataModule,
    VerificationModule,
  ],
})
export class AppModule {
  onApplicationBootstrap() {
    exec('yarn run copy:assets');
  }
}
