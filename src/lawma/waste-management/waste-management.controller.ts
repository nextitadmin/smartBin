import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaWasteManagementService } from './waste-management.service';

@ApiTags('Admin/Waste Management')
@Controller({
    path: 'lawma/waste-management',
    version: '1',
}) 
export class WasteManagementController {
    constructor(private readonly wasteManagementService: LawmaWasteManagementService) {}
    
    @Get('pickups')
    async getSuperAdminPickups() {
        return this.wasteManagementService.getPickupsForSuperAdmin(null, null);
    }
}
