import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BinType, SmartBin } from '@models/smart-bin.model';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { Transaction } from '@models/transaction.model';
import { BinAppDto, CreateApplicationDto } from './dto/binAppDto';
import { SmartBinApplicationStatus, UserRole } from '@models/types';

@Injectable()
export class SmartBinService {
  constructor(
    @InjectModel(SmartBin.name) private readonly smartbinModel: Model<SmartBin>,
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Corporate.name)
    private readonly corporateModel: Model<Corporate>,
    @InjectModel(FacilityManager.name)
    private readonly facilityModel: Model<FacilityManager>,
    @InjectModel(Bill.name) private readonly billModel: Model<Bill>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  // For Resident
  async getResidentBinApplication(residentId: string) {
    const [applications] = await Promise.all([
      this.smartbinModel
        .find({ userId: residentId, userType: UserRole.Resident })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      applications,
    };
  }
  // For FAcilityManager
  async getFacilityManagerBinApplication(facilityManagerId: string) {
    const [facilityManager, bills, wallet, smartbin] = await Promise.all([
      this.facilityModel.findById(facilityManagerId).lean(),
      this.billModel
        .find({
          userId: facilityManagerId,
          userType: 'Facility',
        })
        .lean(),
      this.walletModel
        .findOne({
          userId: facilityManagerId,
          userType: 'Facility',
        })
        .lean(),
      this.smartbinModel
        .findOne({ userId: facilityManagerId, userType: 'Facility' })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    if (!facilityManager) {
      throw new NotFoundException('Facility Manager not found');
    }
    if (!smartbin) {
      throw new NotFoundException(
        'No bin application found for this facility manager',
      );
    }
    return {
      id: smartbin._id,
      userId: smartbin.userId,
      userType: 'Facility',
      fullName: `${
        (facilityManager?.firstName || ' ', facilityManager?.lastName || ' ')
      }`,
      buildingName: smartbin.buildingName,
      buildingType: smartbin.buildingType,
      addressOfFacility: smartbin.address,
      closestLandmark: smartbin.closestLandmark,
      facilityManager,
      bills,
      wallet,
      smartbin,
    };
  }
  // For Agent
  async getAgentBinApplication(agentId: Types.ObjectId) {
    const [applications] = await Promise.all([
      this.smartbinModel
        .find({ userId: agentId, userType: UserRole.Resident })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

  }
  // For Corporate
  async getCorporateBinApplication(corporateId: string) {
    const [applications] = await Promise.all([
      this.smartbinModel
        .find({ userId: corporateId, userType: UserRole.Corporate })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      applications,
    };
  }

  private estimateAnnualSubscription(bills: Bill[]): number {
    const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
    return total * 12; // Assuming the bills are monthly
  }

  async getAllBinApplications() {
    const smartbins = await this.smartbinModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
    if (!smartbins || smartbins.length === 0) {
      throw new NotFoundException('No bin applications found');
    }
    return smartbins;
  }
  // Get bin application by ID
  async getBinApplicationById(id: string) {
    const smartbin = await this.smartbinModel.findById(id).lean();
    if (!smartbin) {
      throw new NotFoundException('Bin application not found');
    }
    return smartbin;
  }
  // Update bin application status
  async updateBinApplicationStatus(id: string, status: string) {
    const smartbin = await this.smartbinModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
    if (!smartbin) {
      throw new NotFoundException('Bin application not found');
    }
    return smartbin;
  }

  // Delete bin application
  async deleteBinApplication(id: string) {
    const smartbin = await this.smartbinModel.findByIdAndDelete(id).lean();
    if (!smartbin) {
      throw new NotFoundException('Bin application not found');
    }
    return { message: 'Bin application deleted successfully' };
  }


  async createBinApplication(dto: CreateApplicationDto, userType: string) {
    const resident = await this.residentModel
      .findOne({ email: dto.email, payerId: dto.payerId })
      .lean();
    

    if (!resident) {
      throw new NotFoundException('Resident does not exist');
    }

    const newBinApplication = new this.smartbinModel({
      userId: String(resident._id),
      customerType: userType,
      ...dto,
      applicationHistory: [
        {
          timestamp: new Date(),
          status: SmartBinApplicationStatus.Pending,
          description: 'Application successful awaiting approval',
        },
      ],
    });

    await newBinApplication.save();
    return newBinApplication;
  }


  async getBinApplicationsByUserId(userId: string, userType:string) {
    const smartbins = await this.smartbinModel
      .find({ userId: userId, customerType: userType })
      .sort({ createdAt: -1 })
      .lean();
    if (!smartbins || smartbins.length === 0) {
      throw new NotFoundException('No bin applications found for this user');
    }
    return smartbins;
  }
}
