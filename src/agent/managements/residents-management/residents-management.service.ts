import { Resident } from '@models/users/resident.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateResidentAccountDto } from '@src/resident/dto/resident.dto';
import { Model } from 'mongoose';
import { CreateAgentResidentAccountDto } from './dto/resident-management.dto';

@Injectable()
export class ResidentsManagementService {
  constructor(
    @InjectModel(Resident.name)
    private readonly residentModel: Model<Resident>,
  ) {}

  async getResidents({ agentId }: { agentId?: string } = {}) {
    const filter: any = {};
    if (agentId) {
      filter.agentId = agentId;
    }
    return this.residentModel.find(filter);
  }

  async getResident(id: string) {
    return this.residentModel.findById(id);
  }

  async createResident(data: CreateAgentResidentAccountDto) {
    return this.residentModel.create(data);
  }

  async updateResident(
    id: string,
    data: Partial<CreateAgentResidentAccountDto>,
  ) {
    return this.residentModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteResident(id: string) {
    return this.residentModel.findByIdAndDelete(id);
  }
}
