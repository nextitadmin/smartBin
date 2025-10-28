import {
  Administrator,
  AdministratorAttributes,
  AdministratorRole,
  AdministratorStatus,
} from '@models/administrator.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateLawmaTeamDto,
  UpdateLawmaTeamStatusDto,
  UpdateTeamMemberDetailsDto,
} from './dto/team.dto';
import { getHashedPassword } from '@common/utils';
import { Paging } from '@common/http';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Administrator.name)
    private readonly teamMemberModel: Model<AdministratorAttributes>,
  ) {}

  async getTeams() {
    const teamsQuery = {
      role: { $ne: AdministratorRole.SuperAdmin },
      deleted_at: null,
    };
    const totalDocument = await this.teamMemberModel.countDocuments(teamsQuery);
    const pagingMeta: Paging = {
      page: 1,
      pages: Math.ceil(totalDocument / 10),
      size: totalDocument,
      total: totalDocument,
    };
    const teams = await this.teamMemberModel
      .find({
        ...teamsQuery,
      })
      .select('name email phoneNumber role status createdAt')
      .lean();
    return {
      data: teams,
      paging: pagingMeta,
    };
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

  async updateTeamDetails(id: string, team: UpdateTeamMemberDetailsDto) {
    const teamMember = await this.teamMemberModel
      .findById(id)
      .select('name email phoneNumber role status createdAt');

    if (!teamMember) {
      throw new BadRequestException('Team not found');
    }

    const existingEmail = await this.teamMemberModel.findOne({
      email: team.email,
      _id: { $ne: id },
    });

    if (existingEmail) {
      throw new BadRequestException(
        'Team member with this email already exists',
      );
    }

    await this.teamMemberModel.findByIdAndUpdate(id, {
      $set: {
        name: team.name,
        email: team.email,
        phoneNumber: team.phoneNumber,
        role: team.role,
      },
    });
    return teamMember;
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
