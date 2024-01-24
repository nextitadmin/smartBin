import { DataTypes, QueryInterface, Sequelize } from 'sequelize';
import { MigrationFn } from 'umzug';
import { SupportedCurrency, WalletStatus } from '../src/models/wallet.model';

type SequelizeMigration = MigrationFn<QueryInterface>;
const TABLE_NAME = 'wallets';

export const up: SequelizeMigration = async ({ context }) => {
  await context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'customers', key: 'id' },
    },
    available_balance: {
      type: DataTypes.DECIMAL(19, 0),
      allowNull: false,
      defaultValue: 0,
    },
    ledger_balance: {
      type: DataTypes.DECIMAL(19, 0),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.ENUM(...Object.values(SupportedCurrency)),
      allowNull: false,
      defaultValue: SupportedCurrency.NGN,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WalletStatus)),
      allowNull: false,
      defaultValue: WalletStatus.Pending,
    },

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
    },
  });
};

export const down: SequelizeMigration = async ({ context }) => {
  await context.dropTable(TABLE_NAME);
};
