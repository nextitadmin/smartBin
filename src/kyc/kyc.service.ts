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
  CreateKycDto,
  IdVerificationDto,
  PersonalInfoDto,
  SignatoriesDto,
  TeamMemberDto,
  UpdateTeamMemberDto,
} from './dto/kyc.dto';
import { CorporateTeam } from '@models/corporate-team.model';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(FacilityManager.name)
    private readonly facilityModel: Model<FacilityManager>,
    @InjectModel(UserKyc.name) private readonly userKycModel: Model<UserKyc>,
    @InjectModel(CorporateTeam.name)
    private readonly corporateTeamModel: Model<CorporateTeam>,
  ) {}

  async createCorporateKyc(dto: {
    userId: string;
    accountType: UserRole;
    applicationData: CreateKycDto;
  }) {
    const signatoryDocs = await this.corporateTeamModel.insertMany(
      dto.applicationData.authorizedSignatories.map((signatory) => ({
        ...signatory,
        userId: dto.userId,
        userType: dto.accountType,
      })),
    );
    const signatoryIds = signatoryDocs.map((s) => s._id);

    const userKyc = await this.userKycModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId), userType: dto.accountType },
      {
        $set: {
          ...dto.applicationData.companyInformation,
          ...dto.applicationData.businessRegistrationCertificate,
          signatories: signatoryIds,
          hasSubmittedPersonalInformation: true,
          hasSubmittedIdentity: true,
          hasSubmittedSignatories: true,
          identityVerificationStatus: IdVerificationStatus.SUBMITTED,
          signatoryVerificationStatus: SignatoryVerificationStatus.SUBMITTED,
        },
      },
      { upsert: true, new: true },
    );

    return {
      hasSubmittedCorporateInformation: userKyc.hasSubmittedPersonalInformation,
      hasSubmittedidentity: userKyc.hasSubmittedIdentity,
      hasSubmittedSignatories: userKyc.hasSubmittedSignatories,
      identityVerificationStatus: userKyc.identityVerificationStatus,
      signatoryVerificationStatus: userKyc.signatoryVerificationStatus,
    };
  }

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
        { new: true },
      );
    }

    if (dto.accountType === UserRole.Facility) {
      await this.facilityModel.findByIdAndUpdate(
        new Types.ObjectId(dto.userId),
        { $set: { ...dto.applicationData } },
        { new: true },
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
  async verifyCorporateKycStatus(dto: {
    userId: string;
    accountType: UserRole;
  }) {
    const userKyc = await this.userKycModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      userType: dto.accountType,
    });

    return {
      hasSubmittedCorporateInformation: userKyc.hasSubmittedPersonalInformation,
      identityVerificationStatus: userKyc.identityVerificationStatus,
      signatoryVerificationStatus: userKyc.signatoryVerificationStatus,
      hasSubmittedSignatories: userKyc.hasSubmittedSignatories,
      hasSubmittedIdentity: userKyc.hasSubmittedIdentity,
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
      hasSubmittedIdentity: userKyc.hasSubmittedIdentity,
    };
  }

  async addSignatories(dto: {
    userId: string;
    accountType: UserRole;
    applicationData: SignatoriesDto;
  }) {
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

  async addCorporateSignatory(dto: {
    userId: string;
    accountType: UserRole;
    signatoryData: TeamMemberDto;
  }) {
    await this.corporateTeamModel.create({
      ...dto.signatoryData,
      userId: dto.userId,
      userType: dto.accountType,
    });

    return {
      message: 'Team member added successfully',
      data: null,
    };
  }

  // Get all signatories for a corporate user's KYC document
  async getAllSignatories(dto: { userId: string; accountType: UserRole }) {
    const corporateTeam = await this.corporateTeamModel
      .find({
        userId: new Types.ObjectId(dto.userId),
        userType: dto.accountType,
        deletedAt: null,
      })
      .lean();
    return {
      message: 'All team members fetched successfully',
      data: corporateTeam,
    };
  }

  // Get a single signatory by signatoryId
  async getSingleSignatory(dto: {
    userId: string;
    accountType: UserRole;
    teamMemberId: string;
  }) {
    const teamMember = await this.corporateTeamModel.findOne({
      _id: new Types.ObjectId(dto.teamMemberId),
      userId: new Types.ObjectId(dto.userId),
      userType: dto.accountType,
      deletedAt: null,
    });

    return {
      message: 'Team member fetched successfully',
      data: teamMember,
    };
  }

  // Update a single signatory by signatoryId
  async updateSignatory(dto: {
    userId: string;
    accountType: UserRole;
    signatoryData: UpdateTeamMemberDto;
    teamMemberId: string;
  }) {
    const updatedTeamMember = await this.corporateTeamModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(dto.teamMemberId),
        userId: new Types.ObjectId(dto.userId),
        userType: dto.accountType,
      },
      {
        $set: { ...dto.signatoryData },
      },
      { new: true },
    );

    return {
      message: 'corporate team member updated successfully',
      data: updatedTeamMember,
    };
  }

  // Remove a single signatory by signatoryId
  async removeSignatory(dto: {
    userId: string;
    accountType: UserRole;
    teamMemberId: string;
  }) {
    await this.corporateTeamModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(dto.teamMemberId),
        userId: new Types.ObjectId(dto.userId),
        userType: dto.accountType,
      },
      {
        deletedAt: new Date(),
      },
    );
    return {
      message: 'corporate team member removed successfully',
      data: null,
    };
  }
}
