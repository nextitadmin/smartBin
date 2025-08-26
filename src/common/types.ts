import { UserRole } from '@models/types';
import { Types } from 'mongoose';

// export type QueryFilter<T> = WhereOptions<T>;
// type RawModelAttributes<T extends Model> = InferAttributes<
//   T,
//   { omit: 'createdAt' | 'updatedAt' | 'deletedAt' | 'version' }
// >;
// export type RawModel<T extends Model> = RawModelAttributes<T>;

// export type RawModelWithAttributes<
//   T extends Model,
//   A extends keyof RawModelAttributes<T>,
// > = Pick<RawModel<T>, A>;

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  token?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

export type CorporateUser = AuthUser;
export type FacilityManagerUser = AuthUser;
export type AgentUser = AuthUser;
export type ResidentUser = AuthUser;
