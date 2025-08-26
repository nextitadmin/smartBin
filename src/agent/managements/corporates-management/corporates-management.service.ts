import { Branch } from '@models/branch.model';
import { Corporate } from '@models/users/corporate.model';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAgentCorporateAccountDto } from './dto/corporates-management.dto';
import { AddCorporateBranchDto } from '@src/corporate/dto/corporate.dto';

@Injectable()
export class CorporatesManagementService {
  constructor(
    @InjectModel(Corporate.name)
    private readonly corporateModel: Model<Corporate>,
    @InjectModel(Branch.name) private readonly branchModel: Model<Branch>, // private readonly corporateService: CorporateService
  ) {}

  async createCorporate(
    payload: CreateAgentCorporateAccountDto & { agentId: string },
  ) {
    const [existingCorporate, existingBusinessName, existingEmail] = await Promise.all([
      this.corporateModel.findOne({ payerId: payload.payerId }),
      this.corporateModel.findOne({ businessName: payload.businessName }),
      this.corporateModel.findOne({ email: payload.email }),
    ]);

    if (existingCorporate) {
      throw new ConflictException('Corporate member already exists');
    }
    if (existingBusinessName) {
      throw new ConflictException('Business Name already exists');
    }
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const corporate = await this.corporateModel.create({...payload, registeredBy: payload.agentId, registeredByModel: 'Agent'});
    
    if (payload.branches.length) {
      await this.addCorporateBranch({
        corporateId: String(corporate._id),
        branchData: payload.branches,
      });
    }
  }

  async getCorporates(agentId: string) {
    return this.corporateModel
      .find({registeredBy: agentId })
      .sort({ createdAt: -1 })
      .select('-__v -password')
      .lean();
  }

  async updateCorporate(
    corporateId: string,
    payload: Partial<CreateAgentCorporateAccountDto>,
  ) {
    return this.corporateModel.findByIdAndUpdate(corporateId, payload, {
      new: true,
    });
  }

  async deleteCorporate(corporateId: string) {
    await this.corporateModel.findByIdAndDelete(corporateId);
    await this.branchModel.deleteMany({ userId: corporateId });
  }

  async getCorporateBranches({ corporateId }: { corporateId: string }) {
    return this.branchModel
      .find({ userId: corporateId })
      .populate('branches')
      .lean();
  }

  async addCorporateBranch({
    corporateId,
    branchData,
  }: {
    corporateId: string;
    branchData: AddCorporateBranchDto[];
  }) {
    return this.branchModel.insertMany(
      branchData.map((data) => ({ ...data, userId: corporateId })),
    );
  }
}
