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
  flutterwave: {
    publicKey: string;
    secretKey: string;
  };
  vtpass: {
    baseUrl: string;
    apiKey: string;
    publicKey: string;
    secretKey: string;
  };
}

const config = (): ConfigAttributes => ({
  port: +process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  logging: {
    level: process.env.LOG_LEVEL,
    disableRequestLogging: Boolean(+process.env.DISABLE_REQUEST_LOGGING),
  },
  database: {
    uri: process.env.DATABASE_URI,
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
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    fromEmail: process.env.MAILGUN_FROM_EMAIL,
    fromName: process.env.MAILGUN_FROM_NAME,
  },
  flutterwave: {
    publicKey: process.env.FLW_PUB_KEY,
    secretKey: process.env.FLW_SEC_KEY,
  },
  vtpass: {
    baseUrl: process.env.VTPASS_BASE_URL,
    apiKey: process.env.VTPASS_API_KEY,
    publicKey: process.env.VTPASS_PUBLIC_KEY,
    secretKey: process.env.VTPASS_SECRET_KEY,
  },
});

const schema = Joi.object<Record<string, string>>({
  PORT: Joi.string().default('4001'),
  NODE_ENV: Joi.string().default('development'),
  LOG_LEVEL: Joi.string().default('info'),
  DISABLE_REQUEST_LOGGING: Joi.string().allow('0', '1').default('0'),

  DATABASE_URI: Joi.string().required(),

  JWT_SECRET: Joi.string().default('N8kNKyW36E9cv1EOLlTjsgDwR9uX'),
  JWT_EXPIRY: Joi.string().default('48h'),

  ENCRYPTION_KEY: Joi.string().default(
    'hpuVxHk-vJfr8Nlk8hY2Y6S6Zz0NDiCeoujmZ55u8_nmV6EMyP7x8YNv5-jycyOs',
  ),

  MAILGUN_API_KEY: Joi.string().required(),
  MAILGUN_DOMAIN: Joi.string().required(),
  MAILGUN_FROM_NAME: Joi.string().default('Lumeo'),
  MAILGUN_FROM_EMAIL: Joi.string().default('no-reply@uselumeo.com'),
  FLW_PUB_KEY: Joi.string().required(),
  FLW_SEC_KEY: Joi.string().required(),
  // FLW_ENC_KEY: Joi.string().optional(),

  VTPASS_BASE_URL: Joi.string().required(),
  VTPASS_API_KEY: Joi.string().required(),
  VTPASS_PUBLIC_KEY: Joi.string().required(),
  VTPASS_SECRET_KEY: Joi.string().required(),
});

export const configModuleOpts: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  load: [config],
  validationSchema: schema,
};
