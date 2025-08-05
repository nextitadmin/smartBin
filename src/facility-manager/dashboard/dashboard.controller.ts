import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
    FacilityManagerAuth,
    AuthenticatedFacilityManager
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller({
    path: 'facility-managers/dashboard',
    version: '1',
})
export class DashboardController {
    constructor(private readonly dasboard: DashboardService) { }
    @FacilityManagerAuth()
    @Get()
    @ApiQuery({ name: 'year', required: false, type: Number })
    async getFacilityManagerDashboard(@AuthenticatedFacilityManager() facility: AuthUser, @Query('year') year?: number,) {
        const queryYear = year || new Date().getFullYear();
        const response = await this.dasboard.getFacilityManagerDashboard(facility.id, queryYear);
        return new SuccessResponse('Facility Manager dashboard retrieved successfully', response);
    }
}