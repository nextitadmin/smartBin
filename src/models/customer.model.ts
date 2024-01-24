import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum CustomerStatus {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive',
  Disabled = 'disabled',
}

export interface CustomerAttributes {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  passcode: string;
  status: CustomerStatus;
  tag: string;
  firebase_tokens?: string[];
  deleted_at?: Date;
}

@Table({
  tableName: 'customers',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Customer extends Model<CustomerAttributes> {
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  first_name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  last_name: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Customer) {
      return `${this.first_name} ${this.last_name}`;
    },
  })
  full_name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  email: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  phone: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  passcode: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(CustomerStatus)),
    defaultValue: CustomerStatus.Pending,
  })
  status: CustomerStatus;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  tag: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  firebase_tokens: string[];
}
