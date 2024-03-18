import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Money } from '../common/utils/money';
import { Customer } from './customer.model';

export enum KycStatus {
  Apprvoed = 'approved',
  Disabled = 'disabled',
}

export enum KycTier {
  One = '1',
  Two = '2',
  Three = '3',
}

export interface KycAttributes {
  id?: number;
  customer_id: number;
  bvn: string;
  nin?: string;
  tier: KycTier;
  status: KycStatus;
}

@Table({
  tableName: 'kycs',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Kyc extends Model<KycAttributes> {
  @ForeignKey(() => Customer)
  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  customer_id: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  bvn: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  nin: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(KycTier)),
  })
  tier: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(KycStatus)),
    defaultValue: KycStatus.Apprvoed,
  })
  status: KycStatus;
}
