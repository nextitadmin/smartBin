// import { PaginatedSuccessResponse, SuccessResponse } from '@common/http';
// import { Controller, Param, Patch } from '@nestjs/common';
// import { MessagePattern } from '@nestjs/microservices';
// import { KycService } from './kyc.service';
// import { AdminMessagePatternCommands } from '@src/shared/constants';

// @Controller({
//   path: 'kyc',
//   version: '1',
// })
// export class AdminKycController {
//   constructor(private readonly kycService: KycService) {}

//   @MessagePattern({ cmd: AdminMessagePatternCommands.KycFlow.GetApplications })
//   async getAllApplications(payload: { page?: string; limit?: string }) {
//     const page = parseInt(payload.page ?? '1', 10);
//     const limit = parseInt(payload.limit ?? '10', 10);

//     const { data: records, paging } = await this.kycService.getAllApplications(
//       page,
//       limit,
//     );
//     return new PaginatedSuccessResponse(
//       'Kyc applications retrieved successfully',
//       records,
//       paging,
//     );
//   }

//   @MessagePattern({
//     cmd: AdminMessagePatternCommands.KycFlow.GetApplicationDetails,
//   })
//   async getApplicationDetails(payload: { applicationId: string }) {
//     const response = await this.kycService.getKycApplicationDetails(
//       payload.applicationId,
//     );
//     return new SuccessResponse(
//       'Kyc application details retrieved successfully',
//       response.data,
//     );
//   }

//   @MessagePattern({
//     cmd: AdminMessagePatternCommands.KycFlow.ApproveApplication,
//   })
//   async approveApplication(payload: { applicationId: string }) {
//     const response = await this.kycService.approveApplication(
//       payload.applicationId,
//     );

//     return new SuccessResponse(
//       'Kyc application approved',
//       response.data
//     );
//   }

//   @MessagePattern({
//     cmd: AdminMessagePatternCommands.KycFlow.RejectApplication,
//   })
//   async rejectApplication(payload: { applicationId: string }) {
//     const response = await this.kycService.rejectApplication(
//       payload.applicationId,
//     );

//     return new SuccessResponse(
//       'Kyc application rejected',
//       response.data,
//     );
//   }
// }
