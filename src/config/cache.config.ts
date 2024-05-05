import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const cacheModuleConfigOpts: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async (configService: ConfigService) => ({
    isGlobal: true,
    store: redisStore,
    url: configService.get('CACHE_URL'),
    ttl: 0,
  }),
  inject: [ConfigService],
};
