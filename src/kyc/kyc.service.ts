import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident } from '@models/users/resident.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { UserRole } from '@models/types';
import {
  AddressVerificationStatus,
  IdVerificationStatus,
  UserKyc,
} from '@models/user-kyc.model';
import {
  AddressVerificationDto,
  CompanyInfoDto,
  IdVerificationDto,
  PersonalInfoDto,
} from './dto/kyc.dto';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(FacilityManager.name)
    private readonly facilityModel: Model<FacilityManager>,
    @InjectModel(UserKyc.name) private readonly userKycModel: Model<UserKyc>,
  ) {}

  // For Resident and Facilty Manager
  async submitPersonalInformation(dto: {
    userId: string;
    accountType: UserRole;
    applicationData: PersonalInfoDto | CompanyInfoDto;
  }) {
    if (dto.accountType === UserRole.Resident) {
      await this.residentModel.findByIdAndUpdate(
        new Types.ObjectId(dto.userId),
        { $set: { ...dto.applicationData } },
        { new: true }
      );
    }

    if (dto.accountType === UserRole.Facility) {
      await this.facilityModel.findByIdAndUpdate(
        new Types.ObjectId(dto.userId),
        { $set: { ...dto.applicationData } },
        { new: true }
      );
    }

    const userKyc = await this.userKycModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId), userType: dto.accountType },
      {
        $set: { ...dto.applicationData, hasSubmittedPersonalInformation: true },
      },
      { upsert: true, new: true },
    );

    return {
      hasSubmittedPersonalInformation: userKyc.hasSubmittedPersonalInformation,
    };
  }

  // For Resident and Facilty Manager
  async idVerification(dto: {
    userId: string;
    accountType: UserRole;
    applicationData: IdVerificationDto;
  }) {
    const userKyc = await this.userKycModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId), userType: dto.accountType },
      {
        $set: {
          ...dto.applicationData,
          hasSubmittedIdentity: true,
          identityVerificationStatus: IdVerificationStatus.SUBMITTED,
        },
      },
      { upsert: true, new: true },
    );

    return {
      hasSubmittedIdentity: userKyc.hasSubmittedIdentity,
    };
  }

  // For Resident and Facilty Manager
  async addressVerification(dto: {
    userId: string;
    accountType: UserRole;
    applicationData: AddressVerificationDto;
  }) {
    const userKyc = await this.userKycModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId), userType: dto.accountType },
      {
        $set: {
          ...dto.applicationData,
          hasSubmittedAddress: true,
          addressVerificationStatus: AddressVerificationStatus.SUBMITTED,
        },
      },
      { upsert: true, new: true },
    );

    return {
      hasSubmittedAddress: userKyc.hasSubmittedAddress,
    };
  }

  // For Resident and Facilty Manager
  async verifyKycStatus(dto: { userId: string; accountType: UserRole }) {
    const userKyc = await this.userKycModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      userType: dto.accountType,
    });

    return {
      identityVerificationStatus: userKyc.identityVerificationStatus,
      addressVerificationStatus: userKyc.addressVerificationStatus,
      hasSubmittedAddress: userKyc.hasSubmittedAddress,
      hasSubmittedIdentity: userKyc.hasSubmittedIdentity
    };
  }

  async addSignatories(dto){
    return {}
  }

  async addCorporateSignatory(dto){
    return {}
  }

  async getAllSignatories(dto){
    return {}
  }

  async updateSignatory(dto){
    return {}
  }

  async removeSignatory(dto){
    return {}
  }
}
