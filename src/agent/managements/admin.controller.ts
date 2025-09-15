import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ResidentsManagementService } from '../managements/residents-management/residents-management.service';
import { CorporatesManagementService } from './corporates-management/corporates-management.service';
import { AdminMessagePatternCommands } from '@src/shared/constants';
import { SuccessResponse } from '@common/http';


@Controller()
export class AdminUsersController {
    constructor(
        private readonly corporatesManagementService: CorporatesManagementService,
        private readonly residentsManagementService: ResidentsManagementService
    ) { }
    // async getAllRegisteredUsers(payload: { agentId: string,page?: string; limit?: string }) {
    //     console.log('Getting all resident bin applications', payload);

    //     const pageNumber = parseInt(payload.page ?? '1', 10);
    //     const limitNumber = parseInt(payload.limit ?? '10', 10);

    //     return this.residentsManagementService.getResidents({payload.agentId});
    // }
    // @MessagePattern({ cmd: AdminMessagePatternCommands.Users.GetAgentRegisteredUsers })
    // async getAgentRegisteredUsers({ agentId, page, limit }: { agentId: string, page?: number, limit?: number }) {
    //     const response = await this.residentsManagementService.getResidents({ agentId });
    //     return new SuccessResponse(
    //         'Agent registered users retrieved successfully',
    //         response,
    //     );
    // }
}