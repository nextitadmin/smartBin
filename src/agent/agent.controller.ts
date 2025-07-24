import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AgentService } from './agent.service';
import { AgentAuthGuard } from '@common/guards/agent.guard'; // custom auth middleware wrapper
import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import {
  AgentAuth,
  AuthenticatedAgent,
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import {
  CreateAgentAccountDto,
  EmailDTO,
  LoginAgentAccountDto,
  ResetPasswordDto,
  VerifyAgentLogin,
} from './dto/agent.dto';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import { Public } from '@common/guards/public.guard';

@ApiTags('Agents')
@AgentAuth()
@Controller({
  path: 'agents',
  version: '1',
})
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Public()
  @Post('register')
  async register(@Body() body: CreateAgentAccountDto) {
    const agent = await this.agentService.registerAgent(body);
    return new SuccessResponse(agent.message, agent.data);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginAgentAccountDto) {
    await this.agentService.login(body);
    return new SuccessResponse('Verification code sent to your email', null);
  }

  @Public()
  @Post('verify-login')
  async verifyLogin(@Body() body: VerifyAgentLogin) {
    const agent = await this.agentService.verifyLoginCode(body.code);
    return new SuccessResponse(agent.message, {
      token: agent.token,
      attributes: agent.data,
    });
  }

  @Public()
  @Post('password-reset/request')
  async requestPasswordReset(@Body() body: EmailDTO) {
    const response = await this.agentService.requestPasswordReset(body.email);
    return new SuccessResponse(response.message, null);
  }

  @Public()
  @Post('password-reset/verify')
  verifyReset(@Body('resetCode') code: string) {
    return this.agentService.verifyResetCode(code);
  }

  @Public()
  @Post('password-reset/complete')
  resetPassword(@Body() body: ResetPasswordDto | any) {
    return this.agentService.completePasswordReset(
      body.password,
      body.confirmPassword,
    );
  }

  @Get('profile')
  @AgentAuth()
  async getProfile(@AuthenticatedAgent() agent: AuthUser) {
    const response = await this.agentService.getProfile(agent.id);
    return new SuccessResponse('agent details fetcted', response);
  }

  @Post('logout')
  @AgentAuth()
  logout() {
    return this.agentService.logout();
  }

  @Patch('profile-picture')
  @AgentAuth()
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedAgent() agent: AuthUser,
  ) {
    await this.agentService.updateProfilePicture(agent.id, file.path);
    return new SuccessResponse('profile picture updated', null);
  }
}
