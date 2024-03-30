import { InferAttributes, WhereOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';

export type QueryFilter<T> = WhereOptions<T>;
type RawModelAttributes<T extends Model> = InferAttributes<
  T,
  { omit: 'createdAt' | 'updatedAt' | 'deletedAt' | 'version' }
>;
export type RawModel<T extends Model> = RawModelAttributes<T>;

export type RawModelWithAttributes<
  T extends Model,
  A extends keyof RawModelAttributes<T>,
> = Pick<RawModel<T>, A>;

export type AuthCustomer = {
  id: string;
};
