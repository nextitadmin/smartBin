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
import { Paging } from '@common/http';
import { generateRandomChars } from '@common/utils';

@Injectable()
export class PickupService {
  constructor(
    @InjectModel(Pickup.name)
    private readonly pickupModel: Model<PickupDocument>,
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

  async getCorporatePickups(corporateId: string) {
    const query = {
      accountId: new Types.ObjectId(corporateId),
      accountType: UserRole.Corporate,
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
    const wasteId = `W#${generateRandomChars(12).toUpperCase()}`;

    await this.pickupModel.create({
      ...dto,
      wasteId,
    });

    return {
      wasteId,
      amount: 100000,
    };
  }
}
