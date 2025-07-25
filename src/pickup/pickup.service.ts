import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePickupDto } from './dto/createPickup.dto';
import { Pickup, PickupDocument } from '@models/pickup';

@Injectable()
export class BinRequestService {
  constructor(
    @InjectModel(Pickup.name)
    private readonly pickupModel: Model<PickupDocument>,
  ) {}

  async findAll() {
    return this.pickupModel.find().exec();
  }

  async create(dto: CreatePickupDto) {
    const newPickup = await this.pickupModel.create(dto); // Ensure the promise is awaited
    return newPickup; // Return the created pickup
  }

  async findById(id: string) {
    return this.pickupModel.findById(id).exec();
  }

  async update(id: string, dto: CreatePickupDto) {
    return this.pickupModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async delete(id: string) {
    return this.pickupModel.findByIdAndDelete(id).exec();
  }

  async getResidentPickup(residentId: string) {
    return this.pickupModel.find({ residentId: residentId }).exec();
  }

  async getAgentPickup(agentId: string) {
    return this.pickupModel.find({ agentId: agentId }).exec();
  }

  async getCorporatePickup(corporateId: string) {
    return this.pickupModel.find({ corporateId: corporateId }).exec();
  }

  async getFacilityManagerPickup(facilityManagerId: string) {
    return this.pickupModel.find({ facilityManagerId: facilityManagerId }).exec();
  }
}
