import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { configModuleOpts } from '@src/config';
import { cacheModuleConfigOpts } from '@src/config/cache.config';
import { jwtConfigOpts } from '@src/config/jwt.config';
import { loggerModuleOpts } from '@src/config/logger.config';
import { mongodbConfigOptions } from '@src/config/mongo.config';
import { PspModule } from '@src/lawma/psp/psp.module';
import { LoggerModule } from 'nestjs-pino';
import { SuperadminsController } from './superadmins.controller';
import { SuperAdminModule } from '@src/super-admin/super-admin.module';
import { LawmaSuperadminsService } from './superadmins.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOpts),
    LoggerModule.forRootAsync(loggerModuleOpts),
    MongooseModule.forRootAsync(mongodbConfigOptions),
    JwtModule.registerAsync(jwtConfigOpts),
    CacheModule.registerAsync(cacheModuleConfigOpts),
    SuperadminsModule,
    SuperAdminModule,
    PspModule,
    AuthModule,
  ],
  controllers: [SuperadminsController],
  providers: [LawmaSuperadminsService],
})
export class SuperadminsModule {}
