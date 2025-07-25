import { Pickup } from '@models/pickup';
import { ResidentWasteMgtDto } from './resident.dto';

export class CorporateWasteMgtDto {
  wasteId: string;
  branch: string;
  date: Date;
  address: string;
  nextPickupDate: Date;
  status: string;

  constructor(data: Pickup) {
    this.wasteId = data[0]._id;
    this.branch = data.branch || '';
    this.date = data.date;
    this.address = data.address;
    this.nextPickupDate = data.nextPickupDate || new Date();
    this.status = data.status;
  }
}
