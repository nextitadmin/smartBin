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
import {
  AssignTeamMemberDto,
  GetPickupDto,
  GetPickupsForPspDto,
  UpdatePickupStatusDto,
  RequestPickupDto,
} from '@src/waste-management/pickup/dto/pickup.dto';
import { AdminUser, AuthUser, PspAdminUser } from '@common/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { NotificationType } from '@models/notification.model';
import { events } from '@common/constants';
import { NotificationEvent } from '@src/notification/dto/notification.event';
import { filter } from 'rxjs';
import { string } from 'joi';
import { PspMembersDocument, PSPMembers} from '@models/psp-members.model';
import { PspTeamMember } from '@common/types';

@Injectable()
export class PickupService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Pickup.name)
    private readonly pickupModel: Model<PickupDocument>,
    @InjectModel(Resident.name)
    private readonly residentModel: Model<Resident>,
    @InjectModel(Agent.name)
    private readonly agentModel: Model<Agent>,
    @InjectModel(Corporate.name)
    private readonly corporateModel: Model<Corporate>,
    @InjectModel(FacilityManager.name)
    private readonly facilityManagerModel: Model<FacilityManager>,
    @InjectModel(PSPMembers.name)
    private readonly pspMembersModel: Model<PspMembersDocument>,
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

  // SuperAdmin pickups
  async getPickupsForAdmin(admin: AdminUser, filters?: GetPickupDto) {
    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.$or = [
        { address: { $regex: filters.search, $options: 'i' } },
        { representative: { $regex: filters.search, $options: 'i' } },
        { phoneNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [pickups, totalRequest] = await Promise.all([
      this.pickupModel
        .find(query)
        .select(
          'wasteId accountId accountType createdAt address representative status',
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.pickupModel.countDocuments(query),
    ]);

    const wastePickedUp = await this.pickupModel.countDocuments({
      status: Status.Completed,
    });
    const pendingPickups = await this.pickupModel.countDocuments({
      status: Status.Pending,
    });

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          status: TransactionStatus.Successful,
          service: ServiceType.WasteDisposal,
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const amountGenerated = result.length > 0 ? result[0].total : 0;

    return {
      adminInfo: {
        username: admin.name,
        adminId: admin.id,
        role: admin.role,
      },
      dashboard: {
        wastePickedUp,
        pendingPickups,
        amountGenerated,
      },
      pickups: pickups,
      paging: {
        totalRequest,
        page: page,
        pages: Math.ceil(totalRequest / limit),
        size: limit,
      },
    };
  }

  async getPendingPickups(psp: PspAdminUser, filters?: GetPickupsForPspDto) {
    const {
      page = 1,
      limit = 10,
      search,
    } = filters || {};
    const skip = (page - 1) * limit;

   const query: any = {
  status: Status.Pending,
  pspId: null,
};

    if (search) {
      query.$or = [
        { address: { $regex: search, $options: 'i' } },
        {customerName:{ $regex: search, $options: 'i' }},
        { representative: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [pickups, totalCount] = await Promise.all([
      this.pickupModel
        .find(query)
        .select(
          'id address accountId customerName createdAt status accountType',
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.pickupModel.countDocuments(query),
    ]);

    const { users } = await this.inferUsers(pickups);

    const formattedPickups = pickups.map((pickup) => {
      const user = users[pickup.accountType].find(
        (user) => user._id.toString() === pickup.accountId.toString(),
      );
      return {
        wasteId: pickup._id,
        address: pickup.address,
        pspTeam: pickup.representative || 'N/A',
        customerName: user
          ? `${user.firstName} ${user.lastName}`
          : pickup.customerName,
        fillUpLevel: 'N/A',
        dateCreated: pickup.createdAt,
      };
    });

    const paging = {
      totalRecords: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      pageSize: limit,
    };

    return {
      pspInfo: {
        username: psp.name,
        pspId: psp.id,
      },
      pickups: formattedPickups,
      paging,
    };
  }



  

  async inferUsers(pickups: any[]) {
    const residentIds = pickups
      .filter((pickup) => pickup.accountType === UserRole.Resident)
      .map((pickup) => pickup.accountId);
    const agentIds = pickups
      .filter((pickup) => pickup.accountType === UserRole.Agent)
      .map((pickup) => pickup.accountId);
    const corporateIds = pickups
      .filter((pickup) => pickup.accountType === UserRole.Corporate)
      .map((pickup) => pickup.accountId);
    const facilityManagerIds = pickups
      .filter((pickup) => pickup.accountType === UserRole.Facility)
      .map((pickup) => pickup.accountId);

    const [residents, agents, corporates, facilityManagers] = await Promise.all(
      [
        this.residentModel
          .find({ _id: { $in: residentIds } })
          .select('_id firstName lastName email localGovernmentArea')
          .lean(),
        this.agentModel
          .find({ _id: { $in: agentIds } })
          .select('_id firstName lastName email localGovernmentArea')
          .lean(),
        this.corporateModel
          .find({ _id: { $in: corporateIds } })
          .select('_id firstName lastName email localGovernmentArea')
          .lean(),
        this.facilityManagerModel
          .find({ _id: { $in: facilityManagerIds } })
          .select('_id firstName lastName email localGovernmentArea')
          .lean(),
      ],
    );

    const users = {
      [UserRole.Resident]: residents,
      [UserRole.Agent]: agents,
      [UserRole.Corporate]: corporates,
      [UserRole.Facility]: facilityManagers,
    };

    return { users };
  }

  async getAssignedPickups(psp: PspAdminUser, filters?: GetPickupsForPspDto) {
    const { page = 1, limit = 10, search } = filters || {};
    const skip = (page - 1) * limit;
    const query: any = { pspId: new Types.ObjectId(psp.id), assignedTo: { $exists: true, $ne: null } };

    if (search) {
      query.$or = [
        { address: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { representative: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }
   
    const [pickups, totalCount] = await Promise.all([
      this.pickupModel
        .find(query)
        .select(
          'id address accountId customerName  updatedAt status accountType assignedTo',
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.pickupModel.countDocuments(query),
    ]);

    const { users } = await this.inferUsers(pickups);

    const formattedPickups = pickups.map((pickup) => {
      const user = users[pickup.accountType].find(
        (user) => user._id.toString() === pickup.accountId.toString(),
      );
      return {
        wasteId: pickup._id,
        address: pickup.address,
        accountId:pickup.accountId,
        accountType:pickup.accountType,
        customerName: user
          ? `${user.firstName} ${user.lastName}`
          : pickup.customerName,
        fillUpLevel: 'N/A',
        assignedTo: pickup.assignedTo || 'N/A',
        dateAssigned: pickup.updatedAt,
      };
      
    });

    const paging = {
      totalRecords: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
    return {
      pspInfo: {
        username: psp.name,
        pspId: psp.id,
      },
      pickups: formattedPickups,
      paging,
    };

    
  }

  
  
  async getCompletedPickups(psp: PspAdminUser, filters?: GetPickupsForPspDto) {
    const {
      page = 1,
      limit = 10,
      search,
    } = filters || {};
    const skip = (page - 1) * limit;

    const query: any = ( {
  status: Status.Completed,
  pspId: new Types.ObjectId(psp.id),
});

    if (search) {
      query.$or = [
        { address: { $regex: search, $options: 'i' } },
        { representative: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [pickups, totalCount] = await Promise.all([
      this.pickupModel
        .find(query)
        .select(
          'id address accountId customerName  updatedAt status accountType assignedTo',
        )
        .skip(skip)
        .limit(limit)
        .sort({updatedAt: -1 })
        .lean(),
      this.pickupModel.countDocuments(query),
    ]);

    const { users } = await this.inferUsers(pickups);

    const formattedPickups = pickups.map((pickup) => {
      const user = users[pickup.accountType].find(
        (user) => user._id.toString() === pickup.accountId.toString(),
      );
      return {
        wasteId: pickup._id,
        address: pickup.address,
        customerName: user
          ? `${user.firstName} ${user.lastName}`
          : pickup.customerName,
        assignedTo: pickup.assignedTo || 'N/A',
        dateCompleted: pickup.updatedAt,
      };
    });

    const paging = {
      totalRecords: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      pageSize: limit,
    };

    return {
      pspInfo: {
        username: psp.name,
        pspId: psp.id,
      },
      pickups: formattedPickups,
      paging,
    };
  }


  async assignTeamMember(
    psp: PspAdminUser,
    pickupId: string,
    dto: AssignTeamMemberDto,
  ) {
    const pickup = await this.pickupModel.findById(pickupId);
    const teamMember = await this.pspMembersModel.findOne({
      _id: dto.teamMemberId,
      psp_id: new Types.ObjectId(psp.id),
    });

    if (!teamMember) {
      throw new NotFoundException(
        `Team member with ID ${dto.teamMemberId} not found in your PSP`,
      );
    }

    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${pickupId} not found`);
    }

    // Update pickup status and assign team member
    pickup.status = Status.Assigned;
    pickup.assignedTo = teamMember.name;
    pickup.agentNote = dto.note;
    pickup.pspId = new Types.ObjectId(psp.id);

    await pickup.save();

    return pickup;
  }


  async getPickupAssignedToTeammember(
    pspTeamMember: PspTeamMember,
    filters?: GetPickupDto,
  ) {
    const { page = 1, limit = 10, search } = filters || {};
    const skip = (page - 1) * limit;
    const query: any = {
      assignedTo: pspTeamMember.name,
      status: { $ne: Status.Assigned },
    };

    if (search) {
      query.$or = [
        { address: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { representative: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [pickups, totalCount] = await Promise.all([
      this.pickupModel
        .find(query)
        .select(
          'id address accountId customerName updatedAt status accountType assignedTo',
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.pickupModel.countDocuments(query),
    ]);

    const { users } = await this.inferUsers(pickups);

    const formattedPickups = pickups.map((pickup) => {
      const user = users[pickup.accountType].find(
        (user) => user._id.toString() === pickup.accountId.toString(),
      );
      return {
        wasteId: pickup._id,
        address: pickup.address,
        accountId: pickup.accountId,
        accountType: pickup.accountType,
        customerName: user
          ? `${user.firstName} ${user.lastName}`
          : pickup.customerName,
        fillUpLevel: 'N/A',
        assignedTo: pickup.assignedTo || 'N/A',
        dateAssigned: pickup.updatedAt,
      };
    });

    const paging = {
      totalRecords: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
      }
    
    return {
      teamMemberInfo: {
        username: pspTeamMember.name,
        memberId: pspTeamMember.id,
      },
      pickups: formattedPickups,
      paging,
    }
  }
  
  //update pickups status
  async updatePickupStatus(id: string, { status }: UpdatePickupStatusDto) {
    const pickup = await this.pickupModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }

    return pickup;
  }
  
  


  async getPickupByWasteId(id: string) {
  const pickup = await this.pickupModel.findById(id).lean();
  if (!pickup) {
    throw new NotFoundException(`Pickup with ID ${id} not found`);
  }

  let customerName: string | undefined;
  let email: string | undefined;
  let localGovernmentArea: string | undefined;

  if (pickup.accountId && pickup.accountType) {
    const { users } = await this.inferUsers([pickup]);
    const user = users[pickup.accountType].find(
      (user) => user._id.toString() === pickup.accountId.toString(),
    );
    if (user) {
      customerName = `${user.firstName} ${user.lastName}`;
      email = user.email;
      localGovernmentArea = user.localGovernmentArea;
    }
  }

  return {
    id: pickup._id,
    customerName,
    phoneNumber:pickup.phoneNumber,
    email,
    address: pickup.address,
    lga:localGovernmentArea || 'N/A',
    status: pickup.status,
    fillUpLevel: 'N/A', 
  };
}


  //delete pickup by ID
  async deletePickupById(id: string) {
    const pickup = await this.pickupModel.findByIdAndDelete(id).lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }
    return { message: 'Pickup deleted successfully' };
  }
}
