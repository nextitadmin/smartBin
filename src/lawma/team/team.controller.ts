import {
  AdminAuth,
  AuthenticatedAdmin,
} from '@common/decorators/auth.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { AdminUser } from '@common/types';
import { SuccessResponse } from '@common/http';
import { CreateLawmaTeamDto, UpdateLawmaTeamStatusDto } from './dto/team.dto';
import { IdParamDTO } from '@src/agent/dto/agent.dto';

@ApiTags('Lawma - Team')
@Controller({
  path: 'lawma/teams',
  version: '1',
})
@AdminAuth()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  async getTeams(@AuthenticatedAdmin() admin: AdminUser) {
    const teams = await this.teamService.getTeams();
    return new SuccessResponse('Teams fetched successfully', teams);
  }

  @Post()
  async createTeam(@Body() team: CreateLawmaTeamDto) {
    const newTeam = await this.teamService.createTeam(team);
    return new SuccessResponse('Team created successfully', newTeam);
  }

  @Put(':id/status')
  async updateTeam(
    @Param('id') { id }: IdParamDTO,
    @Body() team: UpdateLawmaTeamStatusDto,
  ) {
    const updatedTeam = await this.teamService.updateTeam(id, team);
    return new SuccessResponse('Team updated successfully', updatedTeam);
  }

  @Delete(':id')
  async deleteTeam(@Param('id') { id }: IdParamDTO) {
    const deletedTeam = await this.teamService.deleteTeam(id);
    return new SuccessResponse('Team deleted successfully', deletedTeam);
  }
}
