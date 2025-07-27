import { Pickup } from '@models/pickup';
import { ResidentWasteMgtDto } from './resident.dto';

export class FacilityManagerWasteMgtDto extends ResidentWasteMgtDto {
  customerName: string;

  constructor(data: Pickup) {
    super(data);
    this.customerName = data.customerName || '';
  }
}
