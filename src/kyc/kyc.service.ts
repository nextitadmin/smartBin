import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident } from '@models/users/resident.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { UserRole } from '@models/types';
import {
  AddressVerificationStatus,
  IdVerificationStatus,
  SignatoryVerificationStatus,
  UserKyc,
} from '@models/user-kyc.model';
import {
  AddressVerificationDto,
  CompanyInfoDto,
  IdVerificationDto,
  PersonalInfoDto,
  SignatoriesDto,
  TeamMemberDto,
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

// for corporate
    async verifyCorporateKycStatus(dto: { userId: string; accountType: UserRole }) {
    const userKyc = await this.userKycModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      userType: dto.accountType,
    });

    return {
      hasSubmittedCompanyInformation: userKyc.hasSubmittedPersonalInformation,
      identityVerificationStatus: userKyc.identityVerificationStatus,
      signatoryVerificationStatus: userKyc.signatoryVerificationStatus,
      hasSubmittedSignatories: userKyc.hasSubmittedSignatories,
      hasSubmittedIdentity: userKyc.hasSubmittedIdentity
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

  async addSignatories(dto: {
    userId: string;
    accountType: UserRole;
    applicationData: SignatoriesDto;
  }){
    const userKyc = await this.userKycModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId), userType: dto.accountType },
      {
        $set: {
          ...dto.applicationData,
          hasSubmittedSignatories: true,
          signatoryVerificationStatus: SignatoryVerificationStatus.SUBMITTED,
        },
      },
      { upsert: true, new: true },
    );

    return {
      hasSubmittedSignatories: userKyc.hasSubmittedSignatories,
    };
  }

  // Add a single signatory to the corporate user's KYC document
  async addCorporateSignatory(dto: {
    userId: string;
    accountType: UserRole;
    signatoryData: TeamMemberDto;
  }) {
    // const userKyc = await this.userKycModel.findOneAndUpdate(
    //   { userId: new Types.ObjectId(dto.userId), userType: dto.accountType },
    //   {
    //     $push: { signatories: dto.signatoryData },
    //     $set: { hasSubmittedSignatories: true, signatoryVerificationStatus: SignatoryVerificationStatus.SUBMITTED },
    //   },
    //   { upsert: true, new: true },
    // );
    return {  };
  }

  // Get all signatories for a corporate user's KYC document
  async getAllSignatories(dto: { userId: string; accountType: UserRole }) {
    const userKyc = await this.userKycModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      userType: dto.accountType,
    });
    return { signatories: userKyc?.signatories || [] };
  }

  // Get a single signatory by signatoryId
  async getSingleSignatory(dto: { userId: string; accountType: UserRole; signatoryId: string }) {
    const userKyc = await this.userKycModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      userType: dto.accountType,
    });
    const signatory = userKyc?.signatories?.find(
      (s: any) => s._id?.toString() === dto.signatoryId,
    );
    return { signatory };
  }

  // Update a single signatory by signatoryId
  async updateSignatory(dto: {
    userId: string;
    accountType: UserRole;
    signatoryData: string;
  }) {
    // const userKyc = await this.userKycModel.findOneAndUpdate(
    //   {
    //     userId: new Types.ObjectId(dto.userId),
    //     userType: dto.accountType,
    //     'signatories._id': new Types.ObjectId(dto.signatoryId),
    //   },
    //   {
    //     $set: {
    //       'signatories.$': { ...dto.update, _id: new Types.ObjectId(dto.signatoryId) },
    //     },
    //   },
    //   { new: true },
    // );
    // const signatory = userKyc?.signatories?.find(
    //   (s: any) => s._id?.toString() === dto.signatoryId,
    // );
    return { };
  }

  // Remove a single signatory by signatoryId
  async removeSignatory(dto: { userId: string; accountType: UserRole; signatoryId: string }) {
    const userKyc = await this.userKycModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(dto.userId),
        userType: dto.accountType,
      },
      {
        $pull: { signatories: { _id: new Types.ObjectId(dto.signatoryId) } },
      },
      { new: true },
    );
    return { signatories: userKyc?.signatories || [] };
  }
}
