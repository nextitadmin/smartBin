import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginatedSuccessResponse, SuccessResponse } from '@common/http';
import {
  FacilityManagerAuth,
  AuthenticatedFacilityManager,
} from '@common/decorators/auth.decorator';
import { AuthUser, FacilityManagerUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateFacilityUserDto,
  UpdateFacilityUserDto,
} from '../dto/facility-user.dto';
import { FacilityUserService } from './facility-user.service';
import { PaginationQueryDto } from '@common/dto';

@ApiTags('Facility Manager User Management')
@Controller({
  path: 'facility-managers/user',
  version: '1',
})
@FacilityManagerAuth()
export class DashboardController {
  constructor(private readonly facilityUser: FacilityUserService) {}

  @Post()
  async createUser(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Body() dto: CreateFacilityUserDto,
  ) {
    const data = await this.facilityUser.createNewFacilityUser(
      facilityManager.id,
      dto,
    );
    return new SuccessResponse(data.message, data.data);
  }

  @Get()
  async getAllRegisteredUsers(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Query() query: PaginationQueryDto,
  ) {
    const { page = '1', limit = '10' } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { data, paging } = await this.facilityUser.getFacilityUsers(
      facilityManager.id,
      pageNumber,
      limitNumber,
    );

    return new PaginatedSuccessResponse(
      'Facility users retrieved successfully',
      data,
      paging,
    );
  }

  @Get(':id')
  async getRegisteredUserDetails(
    @AuthenticatedFacilityManager() facility: AuthUser,
    @Param('id') facilityUserId: string,
  ) {
    const response = await this.facilityUser.getFacilityUserDetails(
      facilityUserId,
    );
    return new SuccessResponse(
      'Facility user details retrieved successfully',
      response.data,
    );
  }

  @Patch(':id')
  async updateFacilityUserDetails(
    @AuthenticatedFacilityManager() facility: AuthUser,
    @Param('id') facilityUserId: string,
    @Body() dto: UpdateFacilityUserDto,
  ) {
    const response = await this.facilityUser.updateFacilityUser(
      facilityUserId,
      dto,
    );
    return new SuccessResponse(response.message, response.data);
  }

  @Delete(':id')
  async deactivateFacilityUser(
    @AuthenticatedFacilityManager() facility: AuthUser,
    @Param('id') facilityUserId: string,
  ) {
    const response = await this.facilityUser.deactivateFacilityUser(
      facilityUserId,
    );
    return new SuccessResponse(response.message, null);
  }
}
