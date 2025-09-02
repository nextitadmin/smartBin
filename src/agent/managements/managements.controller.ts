import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import {
  AgentAuth,
  AuthenticatedAgent,
} from '@common/decorators/auth.decorator';
import { AgentUser } from '@common/types';
import { ManagementService } from './managements.service';
import { UploadUsersRequestDto } from '../dto/agent.dto';


@ApiTags('Agent - User Management')
@Controller({
  path: 'user-management',
  version: '1',
})
@AgentAuth()
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Post('/upload-user')
  async createResident(
    @AuthenticatedAgent() agent: AgentUser,
    @Body() body: UploadUsersRequestDto,
  ) {
    await this.managementService.uploadUser(body.users, agent.id);
    return new SuccessResponse('User data uploaded successfully', {
        message: 'User data uploaded successfully',
    });
  }
}
