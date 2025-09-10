import { Controller, Get, Query } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuccessResponse } from '@common/http';
import { AuthUser } from '@common/types';
import { ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminMessagePatternCommands } from '@src/shared/constants';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('superAdmnin')
@Controller({
    path: 'super-admin/dashboard',
    version: '1',
})
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    // @Get('dashboard')
    // @ApiQuery({ name: 'year', required: false, type: Number })
    // async getSuperAdminDashboard(@Query('year') year?: number,) {
    //     const queryYear = year || new Date().getFullYear();
    //     const response = await this.superAdminService.getSuperAdminDashboard(queryYear);
    //     return new SuccessResponse('Super Admin dashboard retrieved successfully', response);
    // }
    /////////////////////////////////
    // @Get('revenue-overview')
    // @ApiQuery({ name: 'year', required: false, type: Number })
    // async getRevenueOverview(@Query('year') year?: number,) {
        //     const queryYear = year || new Date().getFullYear();
        //     const response = await this.superAdminService.getRevenueOverview(queryYear);
        //     return new SuccessResponse('Revenue overview retrieved successfully', response);
        // }

        
    @MessagePattern({ 
        cmd: AdminMessagePatternCommands.SuperAdmin.GetDashboard 
    })
    async getDashboardMicroservice(payload: { year?: number }) {
        const queryYear = payload.year || new Date().getFullYear();
        const response = await this.superAdminService.getSuperAdminDashboard(queryYear);
        return new SuccessResponse(
            'Super Admin dashboard retrieved successfully', 
            response
        );
    }

    @MessagePattern({ 
        cmd: AdminMessagePatternCommands.SuperAdmin.GetRevenueOverview })
    async getRevenueOverviewMicroservice(payload: { year?: number }) {
        const queryYear = payload.year || new Date().getFullYear();
        const response = await this.superAdminService.getRevenueOverview(queryYear);
        return new SuccessResponse(
            'Revenue overview retrieved successfully', 
            response
        );
    }
}
