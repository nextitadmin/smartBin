import { DataTypes, QueryInterface, Sequelize } from 'sequelize';
import { MigrationFn } from 'umzug';
import { CustomerStatus } from '../src/models/customer.model';

type SequelizeMigration = MigrationFn<QueryInterface>;
const TABLE_NAME = 'customers';

export const up: SequelizeMigration = async ({ context }) => {
  await context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    passcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CustomerStatus)),
      allowNull: false,
      defaultValue: CustomerStatus.Pending,
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firebase_tokens: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    // other column definitions
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  });
};

export const down: SequelizeMigration = async ({ context }) => {
  await context.dropTable(TABLE_NAME);
};
