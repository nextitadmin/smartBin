import * as Joi from 'joi';

import { ConfigModuleOptions } from '@nestjs/config';

export interface ConfigAttributes {
  port: number;
  nodeEnv: string;
  logging: {
    level: string;
    disableRequestLogging: boolean;
  };
  database: {
    uri: string;
    pool?: {
      min: number;
      max: number;
    };
  };
  jwt: {
    secret: string;
    expiry: string;
  };
  mailgun: {
    apiKey: string;
    domain: string;
    fromName?: string;
    fromEmail?: string;
  };

  alatpay: {
    publicKey: string;
    secretKey: string;
    baseUrl: string;
  };
  frontendUrl: string;
}

const config = (): ConfigAttributes => ({
  port: +process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  logging: {
    level: process.env.LOG_LEVEL,
    disableRequestLogging: Boolean(+process.env.DISABLE_REQUEST_LOGGING),
  },
  database: {
    uri: process.env.DB_URI,
    pool: {
      min: +process.env.DATABASE_POOL_MIN,
      max: +process.env.DATABASE_POOL_MAX,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY,
  },
  mailgun: {
    apiKey: process.env.MAIL_PASSWORD,
    domain: process.env.MAIL_SERVICE,
    fromEmail: process.env.MAIL_EMAIL,
    fromName: process.env.MAIL_USERNAME,
  },

  alatpay: {
    publicKey: process.env.ALAT_CLIENT_ID,
    secretKey: process.env.ALAT_CLIENT_SECRET,
    baseUrl: process.env.ALAT_BASE_URL,
  },
  frontendUrl: process.env.FRONTEND_URL,
});

const schema = Joi.object<Record<string, string>>({
  PORT: Joi.string().default('4001'),
  NODE_ENV: Joi.string().default('development'),
  LOG_LEVEL: Joi.string().default('info'),
  DISABLE_REQUEST_LOGGING: Joi.string().allow('0', '1').default('0'),

  DB_URI: Joi.string().required(),

  JWT_SECRET: Joi.string().default('N8kNKyW36E9cv1EOLlTjsgDwR9uX'),
  JWT_EXPIRY: Joi.string().default('48h'),

  ENCRYPTION_KEY: Joi.string().default(
    'hpuVxHk-vJfr8Nlk8hY2Y6S6Zz0NDiCeoujmZ55u8_nmV6EMyP7x8YNv5-jycyOs',
  ),

  MAIL_PASSWORD: Joi.string().required(),
  MAIL_USERNAME: Joi.string().default('Smartbin'),
  MAIL_EMAIL: Joi.string().default('test-lawma@serene-dev.xyz'),

  ALAT_CLIENT_ID: Joi.string().required(),
  ALAT_CLIENT_SECRET: Joi.string().required(),
  ALAT_BASE_URL: Joi.string().required(),

  FRONTEND_URL: Joi.string().required(),
});

export const configModuleOpts: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  load: [config],
  validationSchema: schema,
};
