import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CorporatesManagementService } from './corporates-management.service';
import {
  AgentAuth,
  AuthenticatedAgent,
} from '@common/decorators/auth.decorator';
import { AgentUser } from '@common/types';
import { SuccessResponse } from '@common/http';
import { CreateAgentCorporateAccountDto, UpdateAgentCorporateAccountDto } from './dto/corporates-management.dto';

@ApiTags('Agent - Corporates Management')
@Controller({
  path: 'corporates-management',
  version: '1',
})
export class CorporatesManagementController {
  constructor(
    private readonly corporatesManagementService: CorporatesManagementService,
  ) {}

  @Post()
  @AgentAuth()
  async createCorporate(
    @AuthenticatedAgent() agent: AgentUser,
    @Body() body: CreateAgentCorporateAccountDto,
  ) {
    const response = await this.corporatesManagementService.createCorporate({
      ...body,
      agentId: agent.id,
    });
    return new SuccessResponse('corporate created', response);
  }

  @Get()
  @AgentAuth()
  async getCorporates(@AuthenticatedAgent() agent: AgentUser) {
    const response = await this.corporatesManagementService.getCorporates(
      agent.id,
    );
    return new SuccessResponse('corporates fetched', response);
  }

  @Get(':corporateId')
  @AgentAuth()
  async getCorporate(@Param('corporateId') corporateId: string) {
    const response = await this.corporatesManagementService.getCorporate(
      corporateId,
    );
    return new SuccessResponse('corporate fetched', response);
  }

  @Patch(':corporateId')
  @AgentAuth()
  async updateCorporate(
    @AuthenticatedAgent() agent: AgentUser,
    @Body() body: UpdateAgentCorporateAccountDto,
    @Param('corporateId') corporateId: string,
  ) {
    const response = await this.corporatesManagementService.updateCorporate(
      corporateId,
      body,
    );
    return new SuccessResponse('corporate updated', response);
  }

  @Delete(':corporateId')
  @AgentAuth()
  async deleteCorporate(
    @AuthenticatedAgent() agent: AgentUser,
    @Param('corporateId') corporateId: string,
  ) {
    const response = await this.corporatesManagementService.deleteCorporate(
      corporateId,
    );
    return new SuccessResponse('corporate deleted', response);
  }
}
