import { Controller, Get, Post, Query } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
    FacilityManagerAuth,
    AuthenticatedFacilityManager
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Facility Manager User Management')
@Controller({
    path: 'facility-managers/user',
    version: '1',
})

@FacilityManagerAuth()
export class DashboardController {
    constructor(private readonly dasboard: DashboardService) { }

    @Post()
    async createUser(@AuthenticatedFacilityManager() facility: AuthUser) {
        // const response = await this.dasboard.getFacilityManagerDashboard(facility.id, queryYear);
        // return new SuccessResponse('Facility Manager dashboard retrieved successfully', response);
    }

    @Get()
    async getAllRegisteredUsers(@AuthenticatedFacilityManager() facility: AuthUser) {
        // const response = await this.dasboard.getFacilityManagerDashboard(facility.id, queryYear);
        // return new SuccessResponse('Facility Manager dashboard retrieved successfully', response);
    }

    @Get(":id")
    async getRegisteredUserDetails(@AuthenticatedFacilityManager() facility: AuthUser) {
        // const response = await this.dasboard.getFacilityManagerDashboard(facility.id, queryYear);
        // return new SuccessResponse('Facility Manager dashboard retrieved successfully', response);
    }
}