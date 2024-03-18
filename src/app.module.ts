import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UtilityModule } from './utility/utility.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfigOpts } from './config/sequelize.config';
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
import { APP_GUARD } from '@nestjs/core';
import { CustomerAuthGuard } from './common/guards/auth.guard';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOpts),
    LoggerModule.forRootAsync(loggerModuleOpts),
    SequelizeModule.forRootAsync(sequelizeConfigOpts),
    JwtModule.registerAsync(jwtConfigOpts),
    CacheModule.registerAsync(cacheModuleConfigOpts),
    EventEmitterModule.forRoot(),
    AuthenticationModule,
    UtilityModule,
    NotificationModule,
    CustomerModule,
    WalletModule,
    PaymentModule,
    KycModule,
    FlutterwaveModule,
    WebhookModule,
  ],
})
export class AppModule {
  onApplicationBootstrap() {
    exec('yarn run copy:assets');
  }
}
