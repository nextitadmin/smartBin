import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResidentsManagementService } from './residents-management.service';
import { SuccessResponse } from '@common/http';
import { AgentAuth, AuthenticatedAgent } from '@common/decorators/auth.decorator';
import { CreateAgentResidentAccountDto } from './dto/resident-management.dto';
import { AgentUser } from '@common/types';

@ApiTags('Agent - Residents Management')
@Controller({
  path: 'residents-management',
  version: '1',
})
@AgentAuth()
export class ResidentsManagementController {
  constructor(
    private readonly residentsManagementService: ResidentsManagementService,
  ) {}

  @Get()
  async getResidents() {
    const residents = await this.residentsManagementService.getResidents();
    return new SuccessResponse('residents fetched', residents);
  }

  @Get(':id')
  async getResident(@Param('id') id: string) {
    const resident = await this.residentsManagementService.getResident(id);
    return new SuccessResponse('resident fetched', resident);
  }

  @Post()
  async createResident(@AuthenticatedAgent() agent: AgentUser, @Body() body: CreateAgentResidentAccountDto) {
    const resident = await this.residentsManagementService.createResident({...body, registeredBy: agent.id });
    return new SuccessResponse('resident created', resident);
  }

  @Patch(':id')
  async updateResident(
    @Param('id') id: string,
    @Body() body: Partial<CreateAgentResidentAccountDto>,
  ) {
    const resident = await this.residentsManagementService.updateResident(
      id,
      body,
    );
    return new SuccessResponse('resident updated', resident);
  }

  @Delete(':id')
  async deleteResident(@Param('id') id: string) {
    await this.residentsManagementService.deleteResident(id);
    return new SuccessResponse('resident deleted', null);
  }
}
