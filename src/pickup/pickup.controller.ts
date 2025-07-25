import { Controller, Get, Query, BadRequestException, UseGuards, Post, Body } from '@nestjs/common';
import { BinRequestService } from './pickup.service';
import { Pickup } from '@models/pickup';
import { ResidentWasteMgtDto } from './dto/resident.dto';
import { FacilityManagerWasteMgtDto } from './dto/facility-manager.dto';
import { CorporateWasteMgtDto } from './dto/corporate.dto';
import { AgentWasteMgtDto } from './dto/agent.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreatePickupDto } from './dto/createPickup.dto';
import { SuccessResponse } from '@common/http';


@Controller('pickup/bin-requests')

export class BinRequestController {
  constructor(private readonly binRequestService: BinRequestService) {}
  @Get()
  async getAll(@CurrentUser() user: any) {
    const userType = user?.userType?.toLowerCase();
    const userId = user?._id; // Assuming user object has an _id property

    let data: Pickup[];

    switch (userType) {
      case 'resident':
        data = await this.binRequestService.getResidentPickup(userId);
        return data.map(d => new ResidentWasteMgtDto(d));
      case 'facility-manager':
        data = await this.binRequestService.getFacilityManagerPickup(userId);
        return data.map(d => new FacilityManagerWasteMgtDto(d));
      case 'corporate':
        data = await this.binRequestService.getCorporatePickup(userId);
        return data.map(d => new CorporateWasteMgtDto(d));
      case 'agent':
        data = await this.binRequestService.getAgentPickup(userId);
        return data.map(d => new AgentWasteMgtDto(d));
      default:
        throw new BadRequestException('Invalid user type');
    }
  }

  @Post()
    async createPickup(@Body() dto: CreatePickupDto) {
    const createdPickup = await this.binRequestService.create(dto);
    return new SuccessResponse('Pickup created successfully', createdPickup);
    }

    @Get('resident')
    async getResidentPickup(@CurrentUser() user: any) {
        const userId = user?._id;
        const data = await this.binRequestService.getResidentPickup(userId);
        return new SuccessResponse('Resident pickups fetched successfully', data);
    }
    
    @Get('facility-manager')
    async getFacilityManagerPickup(@CurrentUser() user: any) {
        const userId = user?._id;
        const data = await this.binRequestService.getFacilityManagerPickup(userId);
        return new SuccessResponse('Facility manager pickups fetched successfully', data);
    }
    
    @Get('corporate')
    async getCorporatePickup(@CurrentUser() user: any) {
         const userId = user?._id;
        const data = await this.binRequestService.getCorporatePickup(userId);
        return new SuccessResponse('Corporate pickups fetched successfully', data);
    }
    
    @Get('agent')
    async getAgentPickup(@CurrentUser() user: any) {
        const userId = user?._id;
        const data = await this.binRequestService.getAgentPickup(userId);
        return new SuccessResponse('Agent pickups fetched successfully', data);
    }

}