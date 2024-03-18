import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Money, getMoney, setMoney } from '../common/utils/money';
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
  wallet_id: string;
  external_wallet_id: string;
  bank_name: string;
  account_number: string;
  currency: SupportedCurrency;
  available_balance: Money;
  ledger_balance: Money;
  note?: string;
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
    unique: true,
    type: DataType.STRING,
  })
  customer_id: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  bank_name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  account_number: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  wallet_id: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  external_wallet_id: string;

  @Column({
    allowNull: false,
    type: DataType.DECIMAL(19, 0),
    set(this: Wallet, val: Money) {
      return setMoney(this, 'available_balance', val);
    },
    get(this: Wallet) {
      return getMoney(this, 'available_balance');
    },
  })
  available_balance: Money;

  @Column({
    allowNull: false,
    type: DataType.DECIMAL(19, 0),
    set(this: Wallet, val: Money) {
      return setMoney(this, 'ledger_balance', val);
    },
    get(this: Wallet) {
      return getMoney(this, 'ledger_balance');
    },
  })
  ledger_balance: Money;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(SupportedCurrency)),
    defaultValue: SupportedCurrency.NGN,
  })
  currency: SupportedCurrency;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  note: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(WalletStatus)),
    defaultValue: WalletStatus.Pending,
  })
  status: WalletStatus;
}
