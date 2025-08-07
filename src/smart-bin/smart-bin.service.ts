import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BinType,
  DEFAULT_SMART_BIN_AMOUNT,
  SmartBin,
  SmartbinStatus,
} from '@models/smart-bin.model';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import {
  ServiceType,
  Transaction,
  TransactionStatus,
} from '@models/transaction.model';
import {
  BinAppDto,
  CreateApplicationDto,
  CreateBusinessApplicationDto,
} from './dto/binAppDto';
import { SmartBinApplicationStatus, UserRole } from '@models/types';
import { generateRandomChars } from '@common/utils';

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
  // async getResidentBinApplication(residentId: string) {
  //   const [applications] = await Promise.all([
  //     this.smartbinModel
  //       .find({
  //         userId: new Types.ObjectId(residentId),
  //         customerType: UserRole.Resident,
  //       })
  //       .sort({ createdAt: -1 })
  //       .lean(),
  //   ]);

  //   return {
  //     applications,
  //   };
  // }

  async getResidentBinApplication(residentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find({
          userId: new Types.ObjectId(residentId),
          customerType: UserRole.Resident,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments({
        userId: new Types.ObjectId(residentId),
        customerType: UserRole.Resident,
      }),
    ]);

    return {
      data: applications,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }

  // For FAcilityManager
  async getFacilityManagerBinApplication(facilityManagerId: string) {
    const [applications] = await Promise.all([
      this.smartbinModel
        .find({
          userId: new Types.ObjectId(facilityManagerId),
          customerType: UserRole.Facility,
        })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    return applications;
  }
  // For Agent
  async getAgentBinApplication(agentId: Types.ObjectId) {
    const [applications] = await Promise.all([
      this.smartbinModel
        .find({
          userId: new Types.ObjectId(agentId),
          customerType: UserRole.Agent,
        })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return applications;
  }
  // For Corporate
  // async getCorporateBinApplication(corporateId: string) {
  //   const [applications] = await Promise.all([
  //     this.smartbinModel
  //       .find({
  //         userId: new Types.ObjectId(corporateId),
  //         customerType: UserRole.Corporate,
  //       })
  //       .sort({ createdAt: -1 })
  //       .lean(),
  //   ]);

  //   return applications;
  // }

  async getCorporateBinApplication(corporateId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find({
          userId: new Types.ObjectId(corporateId),
          customerType: UserRole.Corporate,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments({
        userId: new Types.ObjectId(corporateId),
        customerType: UserRole.Corporate,
      }),
    ]);

    return {
      data: applications,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
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

  async createBinApplication({
    accountId,
    accountType,
    applicationData,
  }: {
    accountId: string;
    accountType: UserRole;
    applicationData: CreateBusinessApplicationDto;
  }) {
    if (applicationData.transactionReference) {
      const successfulCharge = await this.transactionModel.exists({
        transactionReference: applicationData.transactionReference,
        userId: accountId,
        userType: accountType,
        status: TransactionStatus.Successful,
      });

      if (!successfulCharge) {
        throw new BadRequestException(
          'Invalid transaction reference. Please ensure the transaction was successful.',
        );
      }
    }

    const generateTransactionRef = generateRandomChars(10, 'alphanum');
    const newBinApplication = await Promise.all([
      this.smartbinModel.create({
        userId: String(accountId),
        customerType: accountType,
        transactionReference:
          applicationData.transactionReference || generateTransactionRef,
        branchId: applicationData.branchId,
        ...applicationData,
        applicationHistory: [
          {
            timestamp: new Date(),
            status: SmartBinApplicationStatus.Pending,
            description: 'Application successful awaiting approval',
          },
        ],
      }),
      this.transactionModel.create({
        userId: String(accountId),
        transactionReference: generateTransactionRef,
        userType: accountType,
        amount: DEFAULT_SMART_BIN_AMOUNT,
        service: ServiceType.SmartBinPurchase,
        status: applicationData.transactionReference
          ? TransactionStatus.Successful
          : TransactionStatus.Pending,
        meta: {
          branch: applicationData?.branch,
          customerName: applicationData?.customerName,
          tenantName: applicationData?.tenantName,
          receiptId: applicationData.receiptId,
        },
      }),
    ]);

    return {
      application: newBinApplication,
      transactionReference: generateTransactionRef,
    };
  }

  async getBinApplicationsByUserId(userId: string, userType: string) {
    const smartbins = await this.smartbinModel
      .find({ userId: userId, customerType: userType })
      .sort({ createdAt: -1 })
      .lean();
    if (!smartbins || smartbins.length === 0) {
      throw new NotFoundException('No bin applications found for this user');
    }
    return smartbins;
  }

  async getBinApplicationDetails(applicationId: string) {
    const smartBin = await this.smartbinModel.findById(applicationId).lean();

    let userDetails = null;

    if (smartBin.customerType === 'Resident') {
      userDetails = await this.residentModel
        .findById(smartBin.userId)
        .select(
          'payerId firstName lastName email phoneNumber lawmaCustomerType',
        );
    } else if (smartBin.customerType === 'Corporate') {
      userDetails = await this.corporateModel
        .findById(smartBin.userId)
        .select(
          'payerId firstName lastName email phoneNumber lawmaCustomerType',
        );
    }

    return {
      ...smartBin,
      ...userDetails,
    };
  }
}
