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
  GetDeliveredApplicationsDto,
  orderBinsDto,
  scheduleDeliveryDto,
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
import { TeamMember } from '@models/team.model';
import { LAGOS_LGAS } from '@src/utility/utility.constants';
import { timestamp } from 'rxjs';
import { IsPhoneNumber } from 'class-validator';

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
    @InjectModel(TeamMember.name)
    private readonly teamMemberModel: Model<TeamMember>,
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

  async getAgentBinApplication(filter: AgentBinApplicationFilter) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = { agentId: new Types.ObjectId(filter.agentId) };

    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find(query)
        .populate('payment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments(query),
    ]);

    const data = await Promise.all(
      applications.map(async (app) => {
        let customerName = app.name || app.businessName;
        if (!customerName && app.userId) {
          if (app.customerType === 'Resident') {
            const user = await this.residentModel
              .findById(app.userId, 'firstName lastName')
              .lean();
            customerName = `${user.firstName} ${user.lastName}`;
          } else if (app.customerType === 'Corporate') {
            const corp = await this.corporateModel
              .findById(app.userId, 'businessName')
              .lean();
            customerName = corp?.businessName;
          }
        }

        return {
          customerName,
          ...app,
        };
      }),
    );

    return {
      data,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }

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
  async getSmartBinOverview(filters?: { year?: number; binType?: BinType }) {
    const matchStage: any = {};

    if (filters?.year) {
      const year = Number(filters.year);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      matchStage.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (filters?.binType) {
      matchStage.binType = filters.binType;
    }

    const totalApplications = await this.smartbinModel.countDocuments(
      matchStage,
    );
    const smartbinUsersByLGAFromDB = await this.smartbinModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: '$localGovernmentArea',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          lga: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    const lgaCounts = new Map(
      smartbinUsersByLGAFromDB.map((item) => [item.lga, item.count]),
    );

    const smartbinUsersByLGA = LAGOS_LGAS.map((lga) => ({
      lga,
      count: lgaCounts.get(lga) || 0,
    }));
    const recentRecords = await this.smartbinModel
      .find(matchStage)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const records = await Promise.all(
      recentRecords.map(async (app) => {
        const customerName = await this.inferCustomerName(
          app.userId as Types.ObjectId,
          app.customerType as UserRole,
        );
        return {
          id: String(app._id),
          customerName: customerName,
          deliveredBy: app?.assignedTo,
          date: app.deliveredOn,
          address: app.address,
          binType: app.binType,
          binId: app.binId,
          lga: app.localGovernmentArea?.name,
          status: app.status,
        };
      }),
    );
    return {
      totalApplications,
      smartbinUsersByLGA,
      records,
    };
  }

  async getAdminSmartbinOverview(filters?: { year?: number; binType?: BinType }) {
    const query: any = {};
    if (filters?.year) {
      const year = Number(filters.year);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (filters?.binType) {
      query.binType = filters.binType;
    }
    const totalSmartbinUsers = await this.smartbinModel
      .distinct('userId')
      .countDocuments();
    const smartbinRequests = await this.smartbinModel.countDocuments();
    const deliveredSmartbins = await this.smartbinModel.countDocuments({ status: SmartbinStatus.Delivered });

    const smartbinUsersByLGAFromDB = await this.smartbinModel.aggregate([
      {
        $match: query,
      },
      {

        $group: {
          _id: '$localGovernmentArea',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          lga: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    const lgaCounts = new Map(
      smartbinUsersByLGAFromDB.map((item) => [item.lga, item.count]),
    );

    const smartbinUsersByLGA = LAGOS_LGAS.map((lga) => ({
      lga,
      count: lgaCounts.get(lga) || 0,
    }));

    return {
      totalSmartbinUsers,
      smartbinRequests,
      deliveredSmartbins,
      smartbinUsersByLGA,
    };
  }

  // delivered bins
  async getDeliveredSmartBins(filters: GetDeliveredApplicationsDto) {
    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const query: any = { status: SmartbinStatus.Delivered };
    if (filters.type) {
      query.binType = filters.type;
    }

    if (filters.customerType) {
      query.customerType = filters.customerType;
    }


    if (filters.startDate && filters.endDate) {
      query.deliveredOn = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };

      const [residentUsers, corporateUsers, agentUsers, facilityUsers] =
        await Promise.all([
          this.residentModel.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
          }),
          this.corporateModel.find({ businessName: searchRegex }),
          this.agentModel.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
          }),
          this.facilityModel.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
          }),
        ]);

      const userIds = [
        ...residentUsers.map((u) => u._id),
        ...corporateUsers.map((u) => u._id),
        ...agentUsers.map((u) => u._id),
        ...facilityUsers.map((u) => u._id),
      ];

      query.$or = [
        { userId: { $in: userIds } },
        { customerType: searchRegex },
        { address: searchRegex },
        { binType: searchRegex },
      ];
    }
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments(query),
    ]);

    const records = await Promise.all(
      applications.map(async (app) => {
        const customerName = await this.inferCustomerName(
          app.userId as Types.ObjectId,
          app.customerType as UserRole,
        );
        return {
          id: String(app._id),
          customerName,
          assignedTo: app?.assignedTo,
          customerType: app?.customerType,
          date: app.deliveredOn,
          address: app.address,
          binType: app.binType,
          status: app.status,
          lga: app.localGovernmentArea?.name || 'N/A',
        };
      }),
    );

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

  async getAllApplications(filters: GetApplicationsDto) {
    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const query: any = {};
     if (filters.type) {
      query.binType = filters.type;
    }

    if (filters.customerType) {
      query.customerType = filters.customerType;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      query.deliveredOn = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };

      const [residentUsers, corporateUsers, agentUsers, facilityUsers] =
        await Promise.all([
          this.residentModel.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
          }),
          this.corporateModel.find({ businessName: searchRegex }),
          this.agentModel.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
          }),
          this.facilityModel.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
          }),
        ]);

      const userIds = [
        ...residentUsers.map((u) => u._id),
        ...corporateUsers.map((u) => u._id),
        ...agentUsers.map((u) => u._id),
        ...facilityUsers.map((u) => u._id),
      ];

      query.$or = [
        { userId: { $in: userIds } },
        { customerType: searchRegex },
        { address: searchRegex },
        { binType: searchRegex },
      ];
    }
    const [applications, total] = await Promise.all([
      this.smartbinModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments(query),
    ]);

    const records = await Promise.all(
      applications.map(async (app) => {
        const customerName = await this.inferCustomerName(
          app.userId as Types.ObjectId,
          app.customerType as UserRole,
        );
        return {
          id: String(app._id),
          customerName,
          assignedTo: app?.assignedTo,
          customerType: app?.customerType,
          date: app.createdAt,
          address: app.address,
          binType: app.binType,
          lga: app.localGovernmentArea,
          status: app.status,
        };
      }),
    );

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

  //get All bin Orders
  async getAllBinOrders(filters?: orderBinsDto) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;
    const [totalOrders, orderValueAgg, ongoingOrders, completedOrders] =
      await Promise.all([
        this.smartbinModel.countDocuments(),
        this.transactionModel.aggregate([
          {
            $match: {
              service: ServiceType.SmartBinPurchase,
              status: TransactionStatus.Successful,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.smartbinModel.countDocuments({
          status: { $in: [SmartbinStatus.Pending, SmartbinStatus.Approved] },
        }),
        this.smartbinModel.countDocuments({ status: SmartbinStatus.Delivered }),
      ]);

    const [orders, total] = await Promise.all([
      this.smartbinModel
        .find()
        .populate('payment')
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      this.smartbinModel.countDocuments(),
    ]);

    const orderValue = orderValueAgg.length > 0 ? orderValueAgg[0].total : 0;

    const records = orders.map((order) => ({
      id: String(order._id),
      orderId: order.binId,
      name: order?.name,
      phoneNumber: order?.phoneNumber,
      lga: order?.localGovernmentArea,
      orderDate: order.createdAt,
      status: order.status,
    }));

    return {
      summary: {
        totalOrders,
        orderValue,
        ongoingOrders,
        completedOrders,
      },
      orders: records,
      paging: {
        total,
        page,
        pages: Math.ceil(total / limit),
        size: limit,
      },
    };
  }

  // Assign team member to schedule delivery
  async scheduleDelivery(filters: scheduleDeliveryDto) {
    const smartbin = await this.smartbinModel.findById(filters.applicationId);
    if (!smartbin) {
      throw new NotFoundException('Bin application not found');
    }

    if (smartbin.status === SmartbinStatus.Delivered) {
      throw new BadRequestException(
        'This SmartBin has already been delivered.',
      );
    }

    const teamMember = await this.teamMemberModel.findById(
      filters.teamMemberId,
    );
    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    smartbin.status = SmartbinStatus.ScheduledForDelivery;
    smartbin.assignedTo = String(teamMember._id); // <-- store relation to team member as string
    smartbin.applicationHistory.push({
      timestamp: new Date(),
      status: SmartbinStatus.ScheduledForDelivery,
      description:
        filters.comment || `Scheduled for delivery by ${teamMember.name}`,
    });

    await smartbin.save();

    // 1️⃣ email notification
    this.eventEmitter.emit(
      MailNotificationEvents.Application.SmartBinUpdate,
      new SendEmailEvent({
        to: teamMember.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'New SmartBin Delivery Assigned',
        context: {
          teamMember: teamMember.name,
          binId: smartbin.binId,
          address: smartbin.address,
          customer: smartbin.name || smartbin.businessName,
          comment: filters.comment,
        },
      }),
    );

    // 1️⃣ in-app notification
    this.eventEmitter.emit(
      events.notifications.created,
      new NotificationEvent({
        userId: String(teamMember.userId), // link notification to actual user
        title: 'SmartBin Delivery Scheduled',
        text: `You have been assigned to deliver SmartBin ${smartbin.binId}.`,
        type: NotificationType.SmartBinUpdate,
      }),
    );

    return {
      message: 'SmartBin delivery scheduled successfully',
      applicationId: filters.applicationId,
      status: smartbin.status,
      assignedTo: {
        id: teamMember._id,
        name: teamMember.name,
        email: teamMember.email,
        phoneNumber: teamMember.phoneNumber,
      },
      comment: filters.comment,
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

  async updateStatus(orderId: string, newStatus: SmartbinStatus) {
    const statusMessages = {
      [SmartbinStatus.Pending]:
        'Your application has been received and is awaiting approval',
      [SmartbinStatus.Inventory]:
        'Your smart bin has been allocated in inventory',
      [SmartbinStatus.ScheduledForDelivery]:
        'Your smart bin has been scheduled for delivery',
      [SmartbinStatus.Delivered]: 'Your smart bin was delivered successfully',
      [SmartbinStatus.Activated]: 'Smart bin has been successfully activated',
    };

    const order = await this.smartbinModel.findOneAndUpdate(
      { _id: orderId },
      {
        $set: { status: newStatus },
        $push: {
          applicationHistory: {
            status: newStatus,
            timestamp: new Date(),
            description: statusMessages[newStatus],
          },
        },
      },
      { new: true },
    );

    return order;
  }

  private async inferCustomerName(
    userId: Types.ObjectId,
    customerType: UserRole,
  ): Promise<string> {
    let customer: any;
    if (customerType === UserRole.Resident) {
      customer = await this.residentModel
        .findById(userId)
        .select('firstName lastName')
        .lean();
    } else if (customerType === UserRole.Corporate) {
      customer = await this.corporateModel
        .findById(userId)
        .select('businessName')
        .lean();
    } else if (customerType === UserRole.Agent) {
      customer = await this.agentModel
        .findById(userId)
        .select('firstName lastName')
        .lean();
    } else if (customerType === UserRole.Facility) {
      customer = await this.facilityModel
        .findById(userId)
        .select('firstName lastName')
        .lean();
    }

    if (!customer) {
      return 'N/A';
    }

    if (customerType === UserRole.Corporate) {
      return customer.businessName || 'N/A';
    } else {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
  }

  async getOrderTimeline(id: string) {
    const order = await this.smartbinModel
      .findOne({ _id: id })
      .select(
        'id businessName name email address applicationHistory createdAt userId customerType',
      )
      .lean();

    if (!order) throw new NotFoundException('Order not found');
    const customerName = await this.inferCustomerName(
      order.userId as Types.ObjectId,
      order.customerType as UserRole,
    );

    return {
      orderId: order._id,
      dateProcessed: order.createdAt,
      customerName: customerName,
      customerType: order.customerType,
      destination: order.address,
      timeline: order.applicationHistory.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    };
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
    const customerName = await this.inferCustomerName(
      smartBin.userId as Types.ObjectId,
      smartBin.customerType as UserRole,
    );
    const data = {
      id: String(smartBin._id),
      deliveredBy: smartBin?.assignedTo || null,
      customerName,
      customerType: smartBin?.customerType,
      deliveredOn: smartBin?.deliveredOn || null,
      address: smartBin?.address,
      status: smartBin?.status,
      binType: smartBin?.binType,
      binId: smartBin?.binId,
      lga: smartBin?.localGovernmentArea,

    };

    return {
      data,
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

    if (
      smartBin.payment &&
      smartBin.payment.status === TransactionStatus.Successful
    ) {
      throw new BadRequestException('Application already paid!');
    }

    await smartBin.deleteOne();
    return { message: 'Bin application deleted successfully' };
  }

  /////////////////////////////////PARTNERS DASHBOARD///////////////////////////////////
  // smartbin Partners
  async getSmartBinPartnersDashboard() {
    const totalSmartbinOrders = await this.smartbinModel.countDocuments();
    const totalDeliveredSmartbins = await this.smartbinModel.countDocuments({
      status: SmartbinStatus.Delivered,
    });
    const totalRevenueAgg = await this.transactionModel.aggregate([
      {
        $match: {
          service: ServiceType.SmartBinPurchase,
          status: TransactionStatus.Successful,
        },
      },
      {
        $group: { _id: null, total: { $sum: '$amount' } },
      },
    ]);
    const totalRevenue =
      totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

    const ongoingDeliveries = await this.smartbinModel.find({
      status: { $in: [SmartbinStatus.Pending, SmartbinStatus.Approved] },
    });

    return {
      totalSmartbinOrders,
      totalDeliveredSmartbins,
      totalRevenue,
      pendingList: ongoingDeliveries.map((order) => ({
        orderId: order.binId,
        customerName: order.name || order.businessName,
        phoneNumber: order.phoneNumber,
        lga: order.localGovernmentArea,
        orderDate: order.createdAt,
        status: order.status,
      })),
    };
  }
  /////////////////// TEAM MEMBER DASHBOARD ////////////////////////////
  // smartbin Team Member
  async getsmartBinTeamMemberDashboard(partnerId: string) {
    const assignedBins = await this.smartbinModel.find({ assignedTo: partnerId });

    const totalOrders = assignedBins.length;
    const totalDelivered = assignedBins.filter(b => b.status === SmartbinStatus.Delivered).length;
    const pendingDeliveries = assignedBins.filter(b =>
      [SmartbinStatus.Pending, SmartbinStatus.Approved].includes(b.status)
    );

    const transactionRefs = assignedBins.map(b => b.transactionReference).filter(Boolean);

    let totalAmountGenerated = 0;
    if (transactionRefs.length > 0) {
      const transactions = await this.transactionModel.find({
        transactionReference: { $in: transactionRefs },
        service: ServiceType.SmartBinPurchase,
        status: TransactionStatus.Successful,
      });

      totalAmountGenerated = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    }

    const pendingList = pendingDeliveries.map(order => ({
      orderId: order.binId,
      customerName: order.name || order.businessName,
      lga: order.localGovernmentArea?.name || '',
      dateAssigned: order.createdAt,
      assignedBy: 'Lawma Admin', //order.assignedBy || option currently not available in smartbin model
      status: order.status,
    }));

    return {
      totalOrders,
      totalDelivered,
      totalAmountGenerated,
      pendingDeliveries: pendingList,
    };
  }
}

