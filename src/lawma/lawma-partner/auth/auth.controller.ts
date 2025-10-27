import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  LawmaPartnerLoginDto,
  LawmaPartnerVerifyLoginDto,
} from './dto/auth.dto';
import { LawmaPartnerAuthService } from './auth.service';
import { SuccessResponse } from '@common/http';
import { SmartbinPartnerUser } from '@common/types';
import { AuthenticatedSmartbinPartner } from '@common/decorators/auth.decorator';

@Controller({
  path: 'lawma-partner/auth',
  version: '1',
})
export class LawmaPartnerAuthController {
  constructor(
    private readonly lawmaPartnerAuthService: LawmaPartnerAuthService,
  ) {}

  @Post('login')
  async login(@Body() body: LawmaPartnerLoginDto) {
    const response = await this.lawmaPartnerAuthService.login(body);
    return new SuccessResponse('Login successful', response);
  }

  @Post('verify-login')
  async verifyLogin(@Body() body: LawmaPartnerVerifyLoginDto) {
    const response = await this.lawmaPartnerAuthService.verifyLoginCode(
      body.code,
    );
    return new SuccessResponse('Login verified', response);
  }

  @Get('me')
  async getMe(
    @AuthenticatedSmartbinPartner() smartbinPartner: SmartbinPartnerUser,
  ) {
    return new SuccessResponse('User details', smartbinPartner);
  }
}
