import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { KycFlowService } from './kycFlow.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Kyc Applications')
@Controller('kycs')
export class KycFlowController {
  constructor(private readonly kycService: KycFlowService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    enum: ['pending', 'approved', 'rejected'],
  })
  getApplications(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status = 'pending',
  ) {
    return this.kycService.getAllApplications(page, limit);
  }

  @Get(':id')
  getApplicationDetails(@Param('id') applicationId: string) {
    return this.kycService.getApplicationDetails(applicationId);
  }

  @Patch(':id')
  approveApplication(@Param('id') applicationId: string) {
    return this.kycService.approveApplication(applicationId);
  }

  @Patch(':id/reject')
  rejectApplication(@Param('id') applicationId: string) {
    return this.kycService.rejectApplication(applicationId);
  }
}
