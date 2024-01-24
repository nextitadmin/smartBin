import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Money } from '../common/utils/money';
import { Customer } from './customer.model';

export enum WalletStatus {
  Pending = 'pending',
  Active = 'active',
  Disabled = 'disabled',
}

export enum SupportedCurrency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
}

export interface WalletAttributes {
  id?: number;
  customer_id: number;
  available_balance: Money;
  ledger_balance: Money;
  currency: SupportedCurrency;
  status: WalletStatus;
}

@Table({
  tableName: 'wallets',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Wallet extends Model<WalletAttributes> {
  @ForeignKey(() => Customer)
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  customer_id: string;

  @Column({
    allowNull: false,
    type: DataType.DECIMAL(19, 0),
  })
  available_balance: Money;

  @Column({
    allowNull: false,
    type: DataType.DECIMAL(19, 0),
  })
  ledger_balance: Money;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(SupportedCurrency)),
    defaultValue: SupportedCurrency.NGN,
  })
  currency: SupportedCurrency;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(WalletStatus)),
    defaultValue: WalletStatus.Pending,
  })
  status: WalletStatus;
}
