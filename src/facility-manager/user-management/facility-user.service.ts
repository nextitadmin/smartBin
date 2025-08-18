import {
  FacilityUserDocument,
  FacilityUsers,
} from '@models/facility-users.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now, Types } from 'mongoose';
import { CreateFacilityUserDto, UpdateFacilityUserDto } from '../dto/facility-user.dto';

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
          deativationDate: null
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

  async getFacilityUserDetails(facilityUserId:string) {
    const facilityUserDetails = await this.facilityUser.findById(facilityUserId);

    return {
      data: facilityUserDetails
    }
  }

  async updateFacilityUser(facilityUserId:string, dto:UpdateFacilityUserDto) {
    await this.facilityUser.findByIdAndUpdate(facilityUserId, {
      ...dto
    })

    return { message: "facility user details updated successfully", data:null}
  }

  async deactivateFacilityUser(facilityUserId: string) {
    await this.facilityUser.findByIdAndUpdate(facilityUserId, {
      deativationDate: new Date()
    })

    return {
      message: "facility user deactivated successfully"
    }
  }
}
