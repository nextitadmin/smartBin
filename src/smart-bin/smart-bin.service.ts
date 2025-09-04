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
  SmartBinAttributes,
  SmartbinDocument,
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
  TransactionAttributes,
  TransactionStatus,
} from '@models/transaction.model';
import { AuthUser } from '@common/types';
import {
  AgentBinApplicationFilter,
  BinAppDto,
  CreateApplicationDto,
  CreateBusinessApplicationDto,
  CreateFacilityApplicationDto,
  GetApplicationsDto,
} from './dto/binAppDto';
import { SmartBinApplicationStatus, UserRole } from '@models/types';
import { generateRandomChars } from '@common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  InAppNotificationEvents,
  SendInAppEvent,
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { NotificationType } from '@models/notification.model';
import { events } from '@common/constants';
import { NotificationEvent } from '@src/notification/dto/notification.event';
import { Facility } from '@models/facilities';
import { CustomerType } from '@models/report.model';
import { Paging } from '@common/http';

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
    @InjectModel(Facility.name) private readonly facility: Model<Facility>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async getResidentBinApplication(residentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find({
          userId: new Types.ObjectId(residentId),
          customerType: UserRole.Resident,
        })
        .populate('payment')
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
  async getAgentBinApplication(filter: AgentBinApplicationFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.limit) {
      filter.limit = 10;
    }

    const { page, limit, agentId } = filter;
    const skip = (page - 1) * limit;
    const query = {
      agentId: new Types.ObjectId(agentId),
    };
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments(query),
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

  async getFacilityBinApplication(facilityMgrId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find({
          userId: new Types.ObjectId(facilityMgrId),
          customerType: UserRole.Facility,
        })
        .populate('payment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments({
        userId: new Types.ObjectId(facilityMgrId),
        customerType: UserRole.Facility,
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

  // overview
  async getSmartBinOverview() {
    const totalApplications = await this.smartbinModel.countDocuments();

    const deliveredApplications = await this.smartbinModel.countDocuments({
      status: SmartbinStatus.Delivered,
    });

    const recentlyDeliveredRecords = await this.smartbinModel
      .find({ status: SmartbinStatus.Delivered })
      .sort({ deliveredOn: -1 })
      .limit(5)
      .lean();

    const records = recentlyDeliveredRecords.map((app, index) => ({
      sn: index + 1,
      id: String(app._id),
      name: app?.assignedTo,
      date: app.deliveredOn,
      address: app.address,
      binType: app.binType,
      binId: app.binId,
      lga: app.localGovernmentArea,
    }));

    return {
      totalApplications,
      deliveredApplications,
      records,
    };
  }

  // delivered bins
  async getDeliveredSmartBins(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find({ status: SmartbinStatus.Delivered })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments({ status: SmartbinStatus.Delivered }),
    ]);

    const records = applications.map((app, index) => {
      return {
        sn: index + 1,
        id: String(app._id),
        name: app?.assignedTo,
        customerType: app?.customerType,
        date: app.deliveredOn,
        address: app.address,
        binType: app.binType,
        binId: app.binId,
        lga: app.localGovernmentArea,
        status: app.status,
      };
    });

    return {
      records,
      totalApplications: applications.length,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }




  async getAllApplications(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments(),
    ]);

    const records = applications.map((app, index) => {
      return {
        sn: index + 1,
        id: String(app._id),
        name: app?.assignedTo,
        customerType: app?.customerType,
        date: app.deliveredOn,
        address: app.address,
        binType: app.binType,
        binId: app.binId,
        lga: app.localGovernmentArea,
        status: app.status,
      };
    });

    return {
      records,
      totalApplications: applications.length,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }


  // Get bin application by ID
  async getBinApplicationById(id: string) {
    const smartbin = await this.smartbinModel
      .findById(id)
      .populate('payment')
      .lean();
    if (!smartbin) {
      throw new NotFoundException('Bin application not found');
    }
    return smartbin;
  }
  // Update bin application status
  async updateBinApplicationStatus(user: AuthUser, id: string, status: string) {
    const smartbin = await this.smartbinModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
    if (!smartbin) {
      throw new NotFoundException('Bin application not found');
    }
    // 1️⃣ Email notification
    this.eventEmitter.emit(
      MailNotificationEvents.Application.SmartBinUpdate,
      new SendEmailEvent({
        to: user.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'SmartBin Application Status Update',
        context: {
          name: user.firstName,
          status: status,
          applicationId: id,
        },
      }),
    );

    // 2️⃣ In-app notification
    this.eventEmitter.emit(
      events.notifications.created,
      new NotificationEvent({
        userId: user.id,
        title: 'SmartBin Application',
        text: `Your SmartBin application status has been updated to ${status}.`,
        type: NotificationType.SmartBinUpdate,
      }),
      // new SendInAppEvent({
      //   userId: user.id,
      //   text: `Your SmartBin application status has been updated to ${status}.`,
      //   type: NotificationType.SmartBinUpdate,
      //   isRead: false,
      // }),
    );

    return smartbin;
  }

  async createFacilityBinApplication({
    accountId,
    accountType,
    applicationData,
  }: {
    accountId: string;
    accountType: UserRole;
    applicationData: CreateFacilityApplicationDto;
  }) {
    const facilty = await this.facility.findOne({
      _id: applicationData.facilityId,
      userId: accountId,
    });
    if (!facilty) {
      throw new NotFoundException('Facility not found');
    }

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
        facilityId: facilty._id,
        binId: `#${generateRandomChars(4, 'number')}`,
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
          receiptId: applicationData.receiptId,
          buildingName: facilty.buildingName,
        },
      }),
    ]);

    return {
      application: newBinApplication,
      transactionReference: generateTransactionRef,
    };
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
    const smartBin = await this.smartbinModel
      .findById(applicationId)
      .populate('payment')
      .lean();

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

  async deleteBinApplication(applicationId: string) {
    const smartBin:
      | (SmartbinDocument & { payment: TransactionAttributes })
      | any = await this.smartbinModel
        .findById(applicationId)
        .populate('payment');

    if (!smartBin) {
      throw new NotFoundException('Bin application not found');
    }

    if (smartBin.payment.status === TransactionStatus.Successful) {
      throw new BadRequestException('Application already paid!');
    }

    await smartBin.deleteOne();
    return { message: 'Bin application deleted successfully' };
  }
}
