import {
  Administrator,
  AdministratorAttributes,
  AdministratorRole,
  AdministratorStatus,
} from '@models/administrator.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLawmaTeamDto, UpdateLawmaTeamStatusDto } from './dto/team.dto';
import { getHashedPassword } from '@common/utils';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Administrator.name)
    private readonly teamMemberModel: Model<AdministratorAttributes>,
  ) {}

  async getTeams() {
    return this.teamMemberModel
      .find({
        role: { $ne: AdministratorRole.SuperAdmin },
        deleted_at: null,
      })
      .select('name email phoneNumber role status createdAt');
  }

  async createTeam(team: CreateLawmaTeamDto) {
    const teamMember = await this.teamMemberModel.findOne({
      email: team.email,
    });

    if (teamMember) {
      throw new BadRequestException(
        'Team member with this email already exists',
      );
    }

    await this.teamMemberModel.create({
      ...team,
      password: getHashedPassword('password'),
    });
  }

  async updateTeam(id: string, team: UpdateLawmaTeamStatusDto) {
    await this.teamMemberModel.findByIdAndUpdate(id, {
      $set: {
        status: team.status,
      },
    });
  }

  async deleteTeam(id: string) {
    await this.teamMemberModel.findByIdAndUpdate(id, {
      $set: {
        status: AdministratorStatus.Inactive,
        deleted_at: new Date(),
      },
    });
  }
}
