import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePickupDto } from './dto/createPickup.dto';
import { Pickup, PickupDocument, Status } from '@models/pickup';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Resident } from '@models/users/resident.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { SmartBin } from '@models/smart-bin.model';
import { UserRole } from '@models/types';
import { Payer } from '@models/users/payer.model';
import { Paging } from '@common/http';
import { generateRandomChars } from '@common/utils';
import {
  ServiceType,
  Transaction,
  TransactionStatus,
} from '@models/transaction.model';
import { RequestPickupDto } from '@src/waste-management/pickup/dto/pickup.dto';
import { AuthUser } from '@common/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { NotificationType } from '@models/notification.model';
import { events } from '@common/constants';
import { NotificationEvent } from '@src/notification/dto/notification.event';

@Injectable()
export class PickupService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Pickup.name)
    private readonly pickupModel: Model<PickupDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  //  findAll pickups
  async getAllPickups(accountId: Types.ObjectId) {
    return await this.pickupModel
      .find({ accountId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // resident pickups
  async getResidentPickups(residentId: string) {
    const [pickups] = await Promise.all([
      this.pickupModel
        .find({ userId: residentId, userType: UserRole.Resident })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    return {
      pickups,
    };
  }

  // For facility manager
  async getFacilityManagerPickups(facilityManagerId: string) {
    const query = {
      accountId: new Types.ObjectId(facilityManagerId),
      userType: UserRole.Facility,
    };
    const totalDocument = await this.pickupModel.countDocuments(query);
    const pickups = await this.pickupModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    const pagingMeta: Paging = {
      page: 1,
      pages: Math.ceil(totalDocument / 10), // Assuming 10 items per page
      size: totalDocument,
      total: totalDocument,
    };

    return {
      data: pickups,
      paging: pagingMeta,
    };
  }

  async getPickups(account: AuthUser) {
    const query = {
      accountId: new Types.ObjectId(account.id),
      accountType: account.role,
    };
    const totalDocument = await this.pickupModel.countDocuments(query);
    const pickups = await this.pickupModel
      .find(query)
      .populate('payment')
      .sort({ createdAt: -1 })
      .lean();

    const pagingMeta: Paging = {
      page: 1,
      pages: Math.ceil(totalDocument / 10), // Assuming 10 items per page
      size: totalDocument,
      total: totalDocument,
    };

    return {
      data: pickups,
      paging: pagingMeta,
    };
  }

  // For agent
  async getAgentPickups(agentId: string) {
    const [agent] = await Promise.all([
      this.pickupModel
        .find({ userId: agentId, userType: UserRole.Agent })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return {
      agent,
    };
  }

  //get all pickups by ID
  async getPickupById(id: string) {
    const pickup = await this.pickupModel.findById(id).lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }
    return pickup;
  }

  //update pickups status
  async updatePickupStatus(user: AuthUser, id: string, status: Status) {
    const pickup = await this.pickupModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }
    // 1️⃣ Email notification
    this.eventEmitter.emit(
      MailNotificationEvents.Application.PickupUpdate,
      new SendEmailEvent({
        to: user.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Pickup Application Status Update',
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
        title: 'Pickup Application',
        text: `Your Pickup application status has been updated to ${status}.`,
        type: NotificationType.PickupUpdate,
      }),
      // new SendInAppEvent({
      //   userId: user.id,
      //   text: `Your SmartBin application status has been updated to ${status}.`,
      //   type: NotificationType.SmartBinUpdate,
      //   isRead: false,
      // }),
    );
    return pickup;
  }

  // get pickup by waste ID
  async getPickupByWasteId(wasteId: string) {
    const pickup = await this.pickupModel.findOne({ wasteId }).lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with waste ID ${wasteId} not found`);
    }
    return pickup;
  }

  //delete pickup by ID
  async deletePickupById(id: string) {
    const pickup = await this.pickupModel.findByIdAndDelete(id).lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }
    return { message: 'Pickup deleted successfully' };
  }

  //create pickup
  async createPickup({
    accountId,
    accountType,
    applicationData,
  }: {
    accountId: string;
    accountType: UserRole;
    applicationData: CreatePickupDto;
  }) {
    console.log('Creating pickup with data:', {
      accountId,
      accountType,
    });
    if (applicationData.transactionReference) {
      const successfulCharge = await this.transactionModel.exists({
        transactionReference: applicationData.transactionReference,
        userId: accountId,
        userType: accountType,
        status: TransactionStatus.Successful,
      });
      if (!successfulCharge) {
        throw new BadRequestException('Invalid transaction reference.');
      }
    }
    const generateTransactionRef = generateRandomChars(10, 'alphanum');
    const [wastePickupApplicaiton, transaction] = await Promise.all([
      this.pickupModel.create({
        ...applicationData,
        accountId: new Types.ObjectId(accountId),
        accountType: accountType,
        transactionReference:
          applicationData.transactionReference || generateTransactionRef,

        applicationHistory: [
          {
            timestamp: new Date(),
            status: Status.Pending,
            description: 'Application successful awaiting approval',
          },
        ],
      }),
      this.transactionModel.create({
        userId: String(accountId),
        transactionReference: generateTransactionRef,
        userType: accountType,
        amount: 100000,
        service: ServiceType.WasteDisposal,
        status: applicationData.transactionReference
          ? TransactionStatus.Successful
          : TransactionStatus.Pending,
        meta: {
          location: applicationData?.address,
          description: applicationData?.description,
          address: applicationData?.address,
        },
      }),
    ]);
    return {
      application: wastePickupApplicaiton,
      transactionReference: generateTransactionRef,
    };
  }

  // SuperAdmin pickups with dashboard
  async getPickupsForSuperAdmin(admin, status: Status) {
    // 1. Fetch all pickups
    const pickups = await this.pickupModel
      .find({})
      .select('wasteId createdAt address representative status')// only needed fields
      .sort({ createdAt: -1 })
      .lean();

    // 2. Count pickups by status
    const wastePickedUp = await this.pickupModel.countDocuments({
      status: Status.Completed,
    });
    const pendingPickups = await this.pickupModel.countDocuments({
      status: Status.Pending,
    });

    // 3. Calculate total amount generated from successful transactions
    const result = await this.transactionModel.aggregate([
      { $match: { status: TransactionStatus.Successful } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const amountGenerated = result.length > 0 ? result[0].total : 0;

    // 4. Return dashboard + pickup list
    return {
      adminInfo: {
          username: admin.firstName + ' ' + admin.lastName,
          adminId: admin._id,
          status: admin.status,
        },
      dashboard: {
        wastePickedUp,
        pendingPickups,
        amountGenerated,
      },
      pickups,
    };
  }
}
