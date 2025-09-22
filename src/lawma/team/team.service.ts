import {
  Administrator,
  AdministratorAttributes,
  AdministratorRole,
  AdministratorStatus,
} from '@models/administrator.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLawmaTeamDto, UpdateLawmaTeamStatusDto } from './dto/team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Administrator.name)
    private readonly teamMemberModel: Model<AdministratorAttributes>,
  ) {}

  async getTeams() {
    return this.teamMemberModel.find({
      role: { $ne: AdministratorRole.SuperAdmin },
      deleted_at: null,
    });
  }

  async createTeam(team: CreateLawmaTeamDto) {
    return this.teamMemberModel.create(team);
  }

  async updateTeam(id: string, team: UpdateLawmaTeamStatusDto) {
    return this.teamMemberModel.findByIdAndUpdate(id, {
      $set: {
        status: team.status,
      },
    });
  }

  async deleteTeam(id: string) {
    return this.teamMemberModel.findByIdAndUpdate(id, {
      $set: {
        status: AdministratorStatus.Inactive,
        deleted_at: new Date(),
      },
    });
  }
}
