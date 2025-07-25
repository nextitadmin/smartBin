// import { Injectable } from '@nestjs/common';
// import { BinRequest } from '../interfaces/bin-request.interface';

// @Injectable()
// export class BinRequestService {
//   private readonly mockBinRequests: BinRequest[] = [
//     {
//       wasteId: 'req-001',
//       date: new Date(),
//       address: '12 Some Street',
//       representative: 'John Doe',
//       status: 'Pending',
//       customerName: 'ABC Ltd',
//       branch: 'Ikeja',
//       nextPickupDate: new Date(),
//     },
//   ];

//   findAll(): BinRequest[] {
//     return this.mockBinRequests;
//   }
// }

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePickupDto } from './dto/createPickup.dto'; // Adjust the import path as necessary
import { Pickup, PickupDocument } from '@models/pickup'; // Adjust the import path as necessary
@Injectable()
export class BinRequestService {
  constructor(
    @InjectModel(Pickup.name)
    private readonly pickupModel: Model<PickupDocument>,
  ) {}

  async findAll(): Promise<Pickup[]> {
    return this.pickupModel.find().exec();
  }

  async create(dto: CreatePickupDto): Promise<Pickup> {
  const newPickup = new this.pickupModel(dto);
  return newPickup.save();
}
    async findById(id: string): Promise<Pickup> {
        return this.pickupModel.findById(id).exec();
    }

    async update(id: string, dto: CreatePickupDto): Promise<Pickup> {
        return this.pickupModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    }

    async delete(id: string): Promise<Pickup> {
        return this.pickupModel.findByIdAndDelete(id).exec();
    }
}



