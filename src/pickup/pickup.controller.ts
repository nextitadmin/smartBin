import { Controller, Get, Query, BadRequestException, UseGuards, Post, Body } from '@nestjs/common';
import { BinRequestService } from './pickup.service';
import { Pickup } from '@models/pickup';
import { ResidentWasteMgtDto } from './dto/resident.dto';
import { FacilityManagerWasteMgtDto } from './dto/facility-manager.dto';
import { CorporateWasteMgtDto } from './dto/corporate.dto';
import { AgentWasteMgtDto } from './dto/agent.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
// import { AuthGuard } from '@nestjs/passport'; // This import is correct, the error might be an IDE/setup issue.
import { CreatePickupDto } from './dto/createPickup.dto';


@Controller('pickup/bin-requests')

// @UseGuards(AuthGuard)
export class BinRequestController {
  constructor(private readonly binRequestService: BinRequestService) {}
  @Get()
  async getAll(@CurrentUser() user: any) {
    const userType = user?.userType?.toLowerCase();
    const data = await this.binRequestService.findAll();

    switch (userType) {
      case 'resident':
        return data.map(d => new ResidentWasteMgtDto(d));
      case 'facility-manager':
        return data.map(d => new FacilityManagerWasteMgtDto(d));
      case 'corporate':
        return data.map(d => new CorporateWasteMgtDto(d));
      case 'agent':
        return data.map(d => new AgentWasteMgtDto(d));
      default:
        throw new BadRequestException('Invalid user type');
    }
  }

  @Post()
    async createPickup(@Body() dto: CreatePickupDto) {
    return this.binRequestService.create(dto);
    }
}


// @Controller('pickup/bin-requests')
// export class BinRequestController {
//   constructor(private readonly binRequestService: BinRequestService) {}

//   @Get()
//   getAll(@Query('userType') userType: UserType) {
//     const data = this.binRequestService.findAll();

//     switch (userType) {
//       case UserType.RESIDENT:
//         return data.map(d => new ResidentBinRequestDto(d));
//       case UserType.FACILITY_MANAGER:
//         return data.map(d => new FacilityManagerBinRequestDto(d));
//       case UserType.COOPORATE:
//         return data.map(d => new CorporateBinRequestDto(d));
//       default:
//         throw new BadRequestException('Invalid user type');
//     }
//   }
// }