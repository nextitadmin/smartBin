import {
  AuthenticatedAgent,
  AgentAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { AgentUser } from '@common/types';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KycService } from '@src/kyc/kyc.service';
import { AddressVerificationDto, CreateAgentKycDto } from '@src/kyc/dto/kyc.dto';

@ApiTags('Agent Kyc Application')
@Controller({
  path: 'agent/kyc',
  version: '1',
})
@AgentAuth()
export class KycApplicationController {
  constructor(private readonly kycService: KycService) {}

  @Post('/')
  async submitAgentKyc(
    @Body() dto: CreateAgentKycDto,
    @AuthenticatedAgent() agent: AgentUser,
  ) {
    const response = await this.kycService.createAgentKyc({
      userId: agent.id,
      accountType: agent.role,
      applicationData: dto,
    });
    return new SuccessResponse(
      'Agent Kyc Information submitted successfully',
      response,
    );
  }

  @Get('status')
  async getKycApplicationStatus(@AuthenticatedAgent() agent: AgentUser) {
    const response = await this.kycService.verifyAgentKycStatus({
      userId: agent.id,
      accountType: agent.role,
    });

    return new SuccessResponse('Kyc status retrieved successfully', response);
  }
}
