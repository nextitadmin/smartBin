// import { Controller, Get, Query } from '@nestjs/common';
// import { SuperAdminService } from './super-admin.service';
// import { SuccessResponse } from '@common/http';
// import { AuthUser } from '@common/types';
// import { ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

// @Controller({
//   path: 'super-admin',
//   version: '1',
// })
// export class SuperAdminController {
//   constructor(private readonly superAdminService: SuperAdminService) {}

//   @Get('dashboard')
//   async getSuperAdminDashboard() {
//     const response = await this.superAdminService.getSuperAdminDashboard();
//     return new SuccessResponse(
//       'Super Admin dashboard retrieved successfully',
//       response,
//     );
//   }

//   @Get('lawmaAdmin-dashboard')
//   async getLawmaAdminDashboard() {
//     const response = await this.superAdminService.getLawmaAdminDashboard();
//     return new SuccessResponse(
//       'Lawma Admin dashboard retrieved successfully',
//       response,
//     );
//   }

//   @Get('revenue-overview')
//   async getRevenueOverview() {
//     const response = await this.superAdminService.getRevenueOverview();
//     return new SuccessResponse(
//       'Revenue overview retrieved successfully',
//       response,
//     );
//   }
// }
