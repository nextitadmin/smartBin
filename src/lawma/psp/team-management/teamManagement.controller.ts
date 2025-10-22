import { SuccessResponse } from "@common/http";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CreatePspMembersDTO, DeletePspMembersParamDTO, IdDTO, UpdatePspMembersStatusBodyDTO, UpdatePspMembersStatusParamDTO } from "../dto/psp.dto";
import { ApiTags } from "@nestjs/swagger";
import { PspTeamManagement } from "./teamManagement.service";
import { AuthenticatedPspAdmin, PspAdminAuth } from "@common/decorators/auth.decorator";
import { PspAdminUser } from "@common/types";

@ApiTags('PSPs Team Management')
@Controller({
    path: 'lawma/psps/team',
    version: '1'
})
@PspAdminAuth()
export class PspTeamManagementController {
    constructor(
        private readonly pspTeamService: PspTeamManagement
    ) { }

     @Post('members')
      async createPspMembers(
        @AuthenticatedPspAdmin() pspAdmin: PspAdminUser,
        @Body() pspMembers: CreatePspMembersDTO,
      ) {
        const response = await this.pspTeamService.createPspMembers({
          psp_id: pspAdmin.id,
          ...pspMembers,
        });
        return new SuccessResponse('psp members created', response);
      }

    @Get('members')
    async getPspMembers(@AuthenticatedPspAdmin() pspAdmin: PspAdminUser) {
        const response = await this.pspTeamService.getPspMembers(pspAdmin.id);
        return new SuccessResponse('psp members fetched', response);
    }

    @Put('members/:memberId')
    async updatePspMembersStatus(
        @AuthenticatedPspAdmin() pspAdmin: PspAdminUser,
        @Param() param: UpdatePspMembersStatusParamDTO,
        @Body() body: UpdatePspMembersStatusBodyDTO,
    ) {
        const response = await this.pspTeamService.updatePspMembersStatus({
            pspId: pspAdmin.id,
            memberId: param.memberId,
            status: body.status,
        });
        return new SuccessResponse('psp members updated', response);
    }

    @Delete('members/:memberId')
    async deletePspMember(@Param() param: DeletePspMembersParamDTO){
      const response = await this.pspTeamService.deletePspMembers(param.memberId)

      return new SuccessResponse('psp member removed successfully', response)
    }
}