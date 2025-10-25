import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PspService } from './psp.service';
import {
  ChangeStatusPspDto,
  CreatePspDTO,
  CreatePspMembersDTO,
} from './dto/psp.dto';
import { SuccessResponse } from '@common/http';
import {
  IdDTO,
  UpdatePspMembersStatusBodyDTO,
  UpdatePspMembersStatusParamDTO,
} from './dto/psp.dto';
import {
  AdminAuth,
  AuthenticatedAdmin,
  AuthenticatedPspAdmin,
} from '@common/decorators/auth.decorator';
import { AdminUser, PspAdminUser } from '@common/types';
import { AddRoleDto } from '@src/rbac/dto/rbac.dto';

@ApiTags('PSPs')
@Controller({
  path: 'psps',
  version: '1',
})
@AdminAuth()
export class PspController {
  constructor(private readonly pspService: PspService) {}

  @Post()
  async createPsp(
    @Body() psp: CreatePspDTO,
    @AuthenticatedAdmin() admin: AdminUser,
  ) {
    const response = await this.pspService.createPsp(psp, admin);
    return new SuccessResponse('psp created', response);
  }

  @Post('/:id/members')
  async createPspMembers(
    @Param() param: IdDTO,
    @Body() pspMembers: CreatePspMembersDTO,
  ) {
    const response = await this.pspService.createPspMembers({
      psp_id: param.id,
      ...pspMembers,
    });
    return new SuccessResponse('psp members created', response);
  }

  @Get('/lgas')
  async getPspLgas() {
    const response = await this.pspService.getPspLgas();
    return new SuccessResponse('psp lgas fetched', response);
  }

  @Get()
  async getPsps() {
    const response = await this.pspService.getPsps();
    return new SuccessResponse('psps fetched', response);
  }

  @Get(':id')
  async getPsp(@Param() param: IdDTO) {
    const response = await this.pspService.getPsp(param.id);
    return new SuccessResponse('psp fetched', response);
  }

  @Put(':id/change-status')
  async deactivatePsp(@Param() param: IdDTO, @Body() body: ChangeStatusPspDto) {
    const response = await this.pspService.changePspStatus(
      param.id,
      body.status,
    );
    return new SuccessResponse('psp deactivated', response);
  }

  @Get(':id/members')
  async getPspMembers(@Param() param: IdDTO) {
    const response = await this.pspService.getPspMembers(param.id);
    return new SuccessResponse('psp members fetched', response);
  }

  @Put(':id/members/:memberId')
  async updatePspMembersStatus(
    @Param() param: UpdatePspMembersStatusParamDTO,
    @Body() body: UpdatePspMembersStatusBodyDTO,
  ) {
    const response = await this.pspService.updatePspMembersStatus({
      pspId: param.pspId,
      memberId: param.memberId,
      status: body.status,
    });
    return new SuccessResponse('psp members updated', response);
  }

  @Get('roles')
  async getRoles(@AuthenticatedPspAdmin() pspUser: PspAdminUser) {
    const roles = await this.pspService.getRoles(pspUser.pspId);
    return new SuccessResponse('roles fetched', roles);
  }

  @Get('permissions')
  async getPermissions(@AuthenticatedPspAdmin() pspUser: PspAdminUser) {
    const permissions = await this.pspService.getPermissions();
    return new SuccessResponse('permissions fetched', permissions);
  }

  @Post('roles')
  async createRole(
    @AuthenticatedPspAdmin() pspUser: PspAdminUser,
    @Body() payload: AddRoleDto,
  ) {
    await this.pspService.addRole({
      ...payload,
      createdBy: pspUser.pspId,
    });
    return new SuccessResponse('role add', null);
  }
}
