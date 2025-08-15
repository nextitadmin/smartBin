
import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards, Query } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { CreateFacilityDto, UpdateFacilityDto } from '../dto/facility.dto';
import { FacilityManagerAuth } from '@common/decorators/auth.decorator';
import { AuthenticatedFacilityManager } from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SuccessResponse, PaginatedSuccessResponse } from '@common/http';
import { PaginationQueryDto } from '@common/dto';


@Controller({
    path: 'facilities',
    version: '1'
})
@ApiTags('Facilities')
@FacilityManagerAuth()
export class FacilityController {
    constructor(private readonly facilityService: FacilityService) { }

    @Post()
    async addFacility(@Body() dto: CreateFacilityDto, @AuthenticatedFacilityManager() facilityManager: AuthUser) {
        const response = await this.facilityService.addFacility(dto, facilityManager.id);
        return new SuccessResponse('Facility created successfully', response);
    }


    @Get()
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for facilities' })
    async fetchFacilities(@AuthenticatedFacilityManager() facilityManager: AuthUser,
        @Query() query: PaginationQueryDto, @Query('search') search?: string) {
        const { data, paging } = await this.facilityService.fetchFacilities(
            facilityManager.id,
            {
                size: query.limit ? parseInt(query.limit, 10) : 10,
                page: query.page ? parseInt(query.page, 10) : 1,
            },
            search,
        );

        return new PaginatedSuccessResponse(
            'Facilities fetched successfully',
            data,
            paging
        );
    }



    @Get(':id')
    async findOne(@Param('id') id: string, @AuthenticatedFacilityManager() facilityManager: AuthUser) {
        const data = await this.facilityService.findById(id, facilityManager.id);
        return new SuccessResponse('Facility fetched successfully', data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateFacilityDto, @AuthenticatedFacilityManager() facilityManager: AuthUser) {
        const response = await this.facilityService.update(id, dto, facilityManager.id);
        return new SuccessResponse('Facility updated successfully', response);
    }




    @Delete(':id')
    async delete(@Param('id') id: string, @AuthenticatedFacilityManager() facilityManager: AuthUser) {
        const deleted = await this.facilityService.delete(id, facilityManager.id);
        return new SuccessResponse('Facility deleted successfully', deleted);
    }
}
