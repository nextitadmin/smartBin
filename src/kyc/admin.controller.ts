import { PaginatedSuccessResponse, SuccessResponse } from "@common/http";
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { KycService } from "./kyc.service";
import { AdminMessagePatternCommands } from "@src/shared/constants";

@Controller({
  path: 'admin/kyc',
  version: '1',
})
export class AdminKycController {
  constructor(private readonly kycService: KycService) { }

  @MessagePattern({ cmd: AdminMessagePatternCommands.KycFlow.GetApplications })
  async getAllApplications(payload: { page?: string; limit?: string }) {
    const page = parseInt(payload.page ?? '1', 10);
    const limit = parseInt(payload.limit ?? '10', 10);
    const records = await this.kycService.getAllApplications(page, limit);
    return new PaginatedSuccessResponse(
      'Kyc applications retrieved successfully',
      records,
      null
    );
  }
}