import { CorporateTeam } from '@models/corporate-team.model';
import { UserRole } from '@models/types';
import {
  AddressVerificationStatus,
  AgencyInformationStatus,
  SignatoryVerificationStatus,
  UserKyc,
} from '@models/user-kyc.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdVerificationStatus } from 'src/shared/constants';

@Injectable()
export class KycFlowService {
  constructor(
    @InjectModel(UserKyc.name) private readonly userKycModel: Model<UserKyc>,
    @InjectModel(CorporateTeam.name) private readonly corporateTeamModel: Model<CorporateTeam>,
  ) {}

  async getAllApplications(
    page: number,
    limit: number,
    status: string = 'pending',
  ) {
    const skip = (page - 1) * limit;

    const statusType =
      status === 'pending' ? IdVerificationStatus.PENDING : status;

    const [kycRecords, total] = await Promise.all([
      this.userKycModel
        .find({  identityVerificationStatus: statusType })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'userId',
          select: '-password -createdAt -updatedAt -__v',
        })
        .lean(),

      this.userKycModel.countDocuments(),
    ]);

    return {
      data: kycRecords,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }

  async getApplicationDetails(applicationId: string): Promise<{
    data: Record<string, any>;
    message: string;
  }> {
    const application = await this.userKycModel
      .findById(applicationId)
      .populate({
        path: 'userId',
        select: '-password -createdAt -updatedAt -__v',
      })
      .lean();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // If corporate, fetch signatories
    let signatories = [];
    if (
      application.userType === UserRole.Corporate &&
      Array.isArray(application.signatories)
    ) {
      signatories = await this.corporateTeamModel
        .find({ _id: { $in: application.signatories }, deletedAt: null })
        .lean();
    }

    return {
      data: {
        ...application,
        signatories,
      },
      message: 'Application details fetched successfully',
    };
  }

  async approveApplication(applicationId: string) {
    const application = await this.userKycModel.findById(applicationId).lean();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    let update: any = {};

    switch (application.userType) {
      case UserRole.Resident:
      case UserRole.Facility:
        update = {
          identityVerificationStatus: IdVerificationStatus.APPROVED,
          addressVerificationStatus: AddressVerificationStatus.APPROVED,
        };
        break;
      case UserRole.Agent:
        update = {
          identityVerificationStatus: IdVerificationStatus.APPROVED,
          agencyInformationStatus: AgencyInformationStatus.APPROVED,
        };
        break;
      case UserRole.Corporate:
        update = {
          identityVerificationStatus: IdVerificationStatus.APPROVED,
          signatoryVerificationStatus: SignatoryVerificationStatus.APPROVED,
        };
        break;
      default:
        throw new NotFoundException('Unknown user type');
    }

    await this.userKycModel.findByIdAndUpdate(
      applicationId,
      { $set: update },
      { new: true },
    );
    return { data: null, message: 'Kyc application approved' };
  }

  async rejectApplication(applicationId: string) {
    const application = await this.userKycModel.findById(applicationId).lean();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    let update: any = {};

    switch (application.userType) {
      case UserRole.Resident:
      case UserRole.Facility:
        update = {
          identityVerificationStatus: IdVerificationStatus.REJECTED,
          addressVerificationStatus: AddressVerificationStatus.REJECTED,
        };
        break;
      case UserRole.Agent:
        update = {
          identityVerificationStatus: IdVerificationStatus.REJECTED,
          agencyInformationStatus: AgencyInformationStatus.REJECTED,
        };
        break;
      case UserRole.Corporate:
        update = {
          identityVerificationStatus: IdVerificationStatus.REJECTED,
          signatoryVerificationStatus: SignatoryVerificationStatus.REJECTED,
        };
        break;
      default:
        throw new NotFoundException('Unknown user type');
    }

    await this.userKycModel.findByIdAndUpdate(
      applicationId,
      { $set: update },
      { new: true },
    );
    return { data: null, message: 'Kyc application rejected' };
  }
}
