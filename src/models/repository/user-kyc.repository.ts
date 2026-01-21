// user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { UserKyc } from '@models/user-kyc.model';

@Injectable()
export class UserKycRepository extends BaseRepository<UserKyc> {
  constructor(@InjectModel(UserKyc.name) userModel: Model<UserKyc>) {
    super(userModel, [{ path: 'lga', select: '_id name' }]);
  }
}
