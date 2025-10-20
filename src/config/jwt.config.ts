import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '.';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtOpts = (c: ConfigService<ConfigAttributes>): JwtModuleOptions => {
  const jwtSecret = c.get('jwt', { infer: true });
  const jwtExpiresIn = String(jwtSecret.expiry);
  return {
    secret: jwtSecret.secret,
    signOptions: { expiresIn: jwtExpiresIn || '7d', issuer: 'Smartbin' },
  };
};

export const jwtConfigOpts: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  global: true,
  useFactory: (c: ConfigService<ConfigAttributes>) => jwtOpts(c),
};
