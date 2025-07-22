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

@ApiTags('Agents')
@Controller({
  path: 'agents',
  version: '1',
})
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('register')
  async register(@Body() body: CreateAgentAccountDto) {
    const agent = await this.agentService.registerAgent(body);
    return new SuccessResponse(agent.message, agent.data);
  }

  @Post('login')
  async login(@Body() body: LoginAgentAccountDto) {
    await this.agentService.login(body);
    return new SuccessResponse('Verification code sent to your email', null);
  }

  @Post('verify-login')
  async verifyLogin(@Body() body: VerifyAgentLogin, @Req() req: Request) {
    const agent = await this.agentService.verifyLoginCode(body.code);
    return new SuccessResponse(agent.message, {
      token: agent.token,
      attributes: agent.data,
    });
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: EmailDTO) {
    const response = await this.agentService.requestPasswordReset(body.email);
    return new SuccessResponse(response.message, null);
  }

  // @Post('verify-password-reset')
  // verifyReset(@Body('resetCode') code: string, @Req() req: Request) {
  //   return this.agentService.verifyResetCode(code, req.session);
  // }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request | any) {
    return this.agentService.resetPassword(
      body.password,
      body.confirmPassword,
      req.session,
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
    @Req() req: Request,
    @AuthenticatedAgent() agent: AuthUser,
  ) {
    const response = await this.agentService.updateProfilePicture(
      agent.id,
      file.path,
    );
    return new SuccessResponse('profile picture updated', null);
  }
}
