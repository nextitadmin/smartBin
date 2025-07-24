import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

export const cacheModuleConfigOpts: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async (configService: ConfigService) => ({
    store: createKeyv(configService.get('REDIS_URL')),
    isGlobal: true,
  }),
  inject: [ConfigService],
};
