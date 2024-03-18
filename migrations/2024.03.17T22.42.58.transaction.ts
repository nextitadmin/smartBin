import { DataTypes, QueryInterface, Sequelize } from 'sequelize';
import { MigrationFn } from 'umzug';

type SequelizeMigration = MigrationFn<QueryInterface>;
const TABLE_NAME = 'transactions';

export const up: SequelizeMigration = async ({ context }) => {
  await context.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    // other column definitions
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'customers', key: 'id' },
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
  });
};

export const down: SequelizeMigration = async ({ context }) => {
  await context.dropTable(TABLE_NAME);
};
