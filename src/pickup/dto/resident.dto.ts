import { Pickup } from "@models/pickup";

export class ResidentWasteMgtDto {
  wasteId: string;
  date: Date;
  address: string;
  representative?: string;
  status: string;

  constructor(data: Pickup) {
    this.wasteId = data[0]._id;
    this.date = data.date;
    this.address = data.address;
    this.representative = data.representative;
    this.status = data.status;
  }
}
