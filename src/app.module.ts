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
import { BinApplicationModule } from './bin-application/bin-application.module';
import { ResidentModule } from './resident/resident.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfigOpts } from './config/mailer.config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOpts),
    LoggerModule.forRootAsync(loggerModuleOpts),
    MongooseModule.forRootAsync(mongodbConfigOptions),
    JwtModule.registerAsync(jwtConfigOpts),
    CacheModule.registerAsync(cacheModuleConfigOpts),
    // MailerModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService<ConfigAttributes>) => ({
    //     transport: {
    //       host: configService.get('mail').smtp_host,
    //       secure: true,
    //       port: +configService.get('mail').smtp_port,
    //       auth: {
    //         user: configService.get('mail').smtp_user,
    //         pass: configService.get('mail').smtp_password,
    //       },
    //     },
    //     defaults: {
    //       from: '"LAWMA" <notifications@lawma.co>',
    //     },
    //     template: {
    //       dir: __dirname + '/assets',
    //       adapter: new HandlebarsAdapter(),
    //       options: {
    //         strict: true,
    //       },
    //     },
    //   }),
    // }),
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
    BinApplicationModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  onApplicationBootstrap() {
    exec('yarn run copy:assets');
  }
}
