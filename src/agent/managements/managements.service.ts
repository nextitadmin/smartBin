import { Resident } from '@models/users/resident.model';
import { Corporate } from '@models/users/corporate.model';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadUsersRequestDto } from '../dto/agent.dto';

@Injectable()
export class ManagementService {
  constructor(
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(Corporate.name)
    private readonly corporateModel: Model<Corporate>,
  ) {}

  async uploadUser(
    payload: UploadUsersRequestDto['users'],
    registeredBy: string,
  ) {
    let residentPayloads = payload
      .filter((p) => p.customerType === 'resident')
      .map((p) => ({ ...p, registeredBy }));
    let corporatePayloads = payload
      .filter((p) => p.customerType === 'corporate')
      .map((p) => ({ ...p, registeredBy }));

    if (residentPayloads.length) {
      await this.residentModel.insertMany(residentPayloads);
    }

    if (corporatePayloads.length) {
      await this.corporateModel.insertMany(corporatePayloads);
    }
  }
}
