import { DataTypes, QueryInterface, Sequelize } from 'sequelize';
import { MigrationFn } from 'umzug';
import { KycStatus, KycTier } from '../src/models/kyc.model';

type SequelizeMigration = MigrationFn<QueryInterface>;
const TABLE_NAME = 'kycs';

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
      unique: true,
      references: { model: 'customers', key: 'id' },
    },
    bvn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nin: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    tier: {
      type: DataTypes.ENUM(...Object.values(KycTier)),
      allowNull: false,
      defaultValue: KycTier.One,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(KycStatus)),
      allowNull: false,
      defaultValue: KycStatus.Disabled,
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
      defaultValue: null,
    },
  });
};

export const down: SequelizeMigration = async ({ context }) => {
  await context.dropTable(TABLE_NAME);
};
