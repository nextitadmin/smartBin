import { Pickup } from '@models/pickup';

export class AgentWasteMgtDto {
  wasteId: string;
  date: Date;
  address: string;
  representative?: string;
  agentNote?: string;
  status: string;

  constructor(public data: Pickup) {
    // this.wasteId = data[0]._id;
    // this.date = data.date;
    // this.address = data.address;
    // this.representative = data.representative;
    // this.agentNote = data.agentNote;
    // this.status = data.status;
  }
}
export class AgentPickupDto {
  wasteId: string;
  date: Date;
  address: string;
  representative?: string;
  agentNote?: string;
  status: string;

  constructor(public data: Pickup) {
    // this.wasteId = data[0]._id;
    // this.date = data.date;
    // this.address = data.address;
    // this.representative = data.representative;
    // this.agentNote = data.agentNote;
    // this.status = data.status;
  }
}
