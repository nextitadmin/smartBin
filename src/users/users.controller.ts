import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '@models/types';
import { MessagePattern } from '@nestjs/microservices';
import { AdminMessagePatternCommands } from '@src/shared/constants';
import { SuccessResponse } from '@common/http';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Users.GetUsers })
    async getUsers(payload: { page?: string; limit?: string }) {
        const page = parseInt(payload.page ?? '1', 10);
        const limit = parseInt(payload.limit ?? '10', 10);
        const response = await this.usersService.getAllUsers(page, limit);
        return new SuccessResponse(
            'Users retrieved successfully',
            response,
        );
    }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Users.GetUser })
    async getUserDetails(payload: { userId: string, role: UserRole }) {
        const response = await this.usersService.getUserById(payload.userId, payload.role);
        return new SuccessResponse(
            'User details retrieved successfully',
            response,
        );
    }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Users.GetFacilityUsers })
    async getFacilityUsers(payload: { accountId: string, page: number, limit: number }) {

        const response = await this.usersService.getFacilityUsers(payload.accountId, payload.page, payload.limit);
        return new SuccessResponse(
            'Facility users retrieved successfully',
            response,
        );
    }


    @MessagePattern({ cmd: AdminMessagePatternCommands.Users.GetAgentRegisteredUsers })
    async getAgentRegisteredUsers({ agentId, page, limit }: { agentId: string, page?: number, limit?: number }) {
        const response = await this.usersService.getAgentRegisteredUsers({ agentId }, page, limit);
        return new SuccessResponse(
            'Agent registered users retrieved successfully',
            response,
        );
    }

}
