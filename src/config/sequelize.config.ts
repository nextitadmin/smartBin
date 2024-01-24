import { ConfigService } from '@nestjs/config';
import {
  SequelizeModule,
  SequelizeModuleAsyncOptions,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';
import { ConfigAttributes } from '.';
import { Logger } from '@nestjs/common';

const getOpts = (
  c: ConfigService<ConfigAttributes>,
): SequelizeModuleOptions => {
  const logger = new Logger(SequelizeModule.name);
  const db = c.get('database', { infer: true });
  return {
    dialect: 'postgres',
    uri: db.uri,
    synchronize: false,
    autoLoadModels: true,
    logging: (sql) => logger.verbose(sql),
    dialectOptions: { decimalNumbers: true },
    sync: { alter: true },
  };
};

export const sequelizeConfigOpts: SequelizeModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (c: ConfigService<ConfigAttributes>) => getOpts(c),
};
