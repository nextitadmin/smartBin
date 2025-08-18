import {
  FacilityUserDocument,
  FacilityUsers,
} from '@models/facility-users.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFacilityUserDto } from '../dto/facility-user.dto';

@Injectable()
export class FacilityUserService {
  constructor(
    @InjectModel(FacilityUsers.name) private facilityUser: Model<FacilityUsers>,
  ) {}

  async createNewFacilityUser(accountId: string, dto: CreateFacilityUserDto) {
    const data = await this.facilityUser.create({
      accountId: accountId,
      ...dto,
    });

    return { message: 'Facility user added successfully', data: data };
  }

  async getFacilityUsers(facilityMgrId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.facilityUser
        .find({
          accountId: new Types.ObjectId(facilityMgrId),
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.facilityUser.countDocuments({
        accountId: new Types.ObjectId(facilityMgrId),
      }),
    ]);

    return {
      data: users,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }

  async getFacilityUserDetails() {}

  async updateFacilityUser() {}

  async deactivateFacilityUser() {}
}
