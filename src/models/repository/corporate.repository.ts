// user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Corporate, CorporateDocument } from '@models/users/corporate.model';

@Injectable()
export class CorporateRepository extends BaseRepository<CorporateDocument> {
  constructor(
    @InjectModel(Corporate.name) corporateModel: Model<CorporateDocument>,
  ) {
    super(corporateModel, [{ path: 'lga', select: 'id name' }]);
  }
}
