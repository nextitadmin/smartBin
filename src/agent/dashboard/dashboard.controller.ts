import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
    AgentAuth,
    AuthenticatedAgent
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller({
    path: 'agents/dashboard',
    version: '1',
})
export class DashboardController {
    constructor(private readonly dasboard: DashboardService) { }
    @AgentAuth()
    @Get()
    @ApiQuery({ name: 'year', required: false, type: Number })
    async getAgentDashboard(@AuthenticatedAgent() agent: AuthUser, @Query('year') year?: number,) {
        const queryYear = year || new Date().getFullYear();
        const response = await this.dasboard.getAgentDashboard(agent.id, queryYear);
        return new SuccessResponse('Agent dashboard retrieved successfully', response);
    }
}