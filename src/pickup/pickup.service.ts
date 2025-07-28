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
import { Transaction } from '@models/transaction.model';
import { SmartBin } from '@models/smart-bin.model';
import { UserRole } from '@models/types';
import { Payer } from '@models/users/payer.model';

@Injectable()
export class PickupService {
  constructor(
    @InjectModel(Pickup.name)
    private readonly pickupModel: Model<PickupDocument>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Corporate.name)
    private readonly corporateModel: Model<Corporate>,
    @InjectModel(FacilityManager.name)
    private readonly facilityManagerModel: Model<FacilityManager>,
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(Bill.name) private readonly billModel: Model<Bill>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(SmartBin.name) private readonly smartBinModel: Model<SmartBin>,
  ) {}

  //  findAll pickups
  async getAllPickups() {
    const pickups = await this.pickupModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
    if (!pickups || pickups.length === 0) {
      throw new NotFoundException('No pickup requests found');
    }
    return pickups;
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
    const [facilityManager, pickups] = await Promise.all([
      this.facilityManagerModel.findById(facilityManagerId).lean(),
      this.pickupModel
        .find({ userId: facilityManagerId, userType: UserRole.Facility })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    this.walletModel.findOne({
      userId: facilityManagerId,
      userType: UserRole.Facility,
    });
    this.billModel.findOne({
      userId: facilityManagerId,
      userType: UserRole.Facility,
    });
    if (!facilityManager) {
      throw new NotFoundException('Facility Manager not found');
    }
    if (!pickups) {
      throw new NotFoundException(
        'No pickup requests found for this facility manager',
      );
    }
    return {
      id: pickups[0]._id,
      name:
        pickups[0].customerName ||
        facilityManager.firstName + ' ' + facilityManager.lastName,
      address: pickups[0].address,
      date: pickups[0].date,
      representative: pickups[0].representative,
      status: pickups[0].status || Status.Pending,
      agentNote: pickups[0].agentNote,
      time: pickups[0].time,
      wasteId: pickups[0].wasteId,
      issuedOn: pickups[0].issuedOn,
      paymentDue: pickups[0].paymentDue,
      billRef: pickups[0].billReference,
      facilityManager,
      pickups,
    };
  }

  // For corporate
  async getCorporatePickups(corporateId: string) {
    const [corporate] = await Promise.all([
      this.pickupModel
        .find({ userId: corporateId, userType: UserRole.Corporate })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    if (!corporate) {
      throw new NotFoundException('Corporate not found');
    }
    return {
      corporate,
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
  async updatePickupStatus(id: string, status: Status) {
    const pickup = await this.pickupModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }
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
  async createPickup(dto: CreatePickupDto) {
    const { payerId, ...pickupData } = dto as CreatePickupDto & {
      payerId: string;
    };

    const user = await this.pickupModel.findById(payerId).lean();
    if (!user) {
      throw new NotFoundException(`User with ID ${payerId} not found`);
    }

    const customerType = user.customerType;

    const newPickup = new this.pickupModel({
      payerId: new Types.ObjectId(payerId),
      ...pickupData,
      customerType: customerType,
      status: Status.Pending, // Default status
    });

    await newPickup.save();
    return newPickup;
  }
}
