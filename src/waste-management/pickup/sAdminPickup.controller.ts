import { Controller, Get } from '@nestjs/common';
import { PickupService } from './pickup.service';
import { SuccessResponse } from '@common/http';
import { stat } from 'fs';

@Controller({
    path:'pickup',
    version: '1',
})

export class sAdminPickupController {
    constructor (private readonly pickupService: PickupService) {}
    
    @Get('all')
    async getSuperAdminPickups(admin, status) {
        const response = await this.pickupService.getPickupsForSuperAdmin(admin, status);
        return new SuccessResponse(
          'All Pickups retrieved successfully',
            response,
        );
    }
}
