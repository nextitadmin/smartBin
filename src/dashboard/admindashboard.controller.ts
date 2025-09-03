import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { AdminDashboardService } from './adminDashboard.service';
import { SuccessResponse } from '@common/http';
import { AuthenticatedUser, Auth } from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';

@ApiTags('Admin Dashboard')
@Controller({
    path: 'admindashboard',
    version: '1',
})
export class AdminDashboardController {
    constructor(private readonly adminDashboardService: AdminDashboardService) { }

    // @Auth('admin')
    @Get('dashboard')
    @ApiQuery({ name: 'year', required: false, type: Number })
    async getAdminDashboard(@AuthenticatedUser() user: AuthUser, @Query('year') year?: number,) {
        const queryYear = year || new Date().getFullYear();
        const response = await this.adminDashboardService.getAdminDashboard(queryYear);
        return new SuccessResponse('Admin dashboard retrieved successfully', response);
    }

    @Get('revenueOverview')
    @ApiQuery({ name: 'year', required: false, type: Number })
    async getRevenueOverview(@AuthenticatedUser() user: AuthUser, @Query('year') year?: number,) {
        const queryYear = year || new Date().getFullYear();
        const response = await this.adminDashboardService.getRevenueOverview(queryYear);
        return new SuccessResponse('Revenue overview retrieved successfully', response);
    }
}
