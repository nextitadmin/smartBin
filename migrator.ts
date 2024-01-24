import * as dotenv from 'dotenv';
import { SequelizeStorage, Umzug } from 'umzug';
import { Sequelize } from 'sequelize';
import { readFileSync } from 'fs';

dotenv.config();

const { DATABASE_URI } = process.env;

if (!DATABASE_URI) {
  console.error('ERROR: No database uri configured!!');
  process.exit(1);
}

const sequelize = new Sequelize(DATABASE_URI, { logging: false });

export const umzug = new Umzug({
  migrations: { glob: 'migrations/*.ts' },
  logger: console,
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'umzug_migration' }),
  create: {
    folder: 'migrations',
    template: (f) => [
      [f, readFileSync(`${__dirname}/migrations/migration.stub`).toString()],
    ],
  },
});

umzug.runAsCLI();
