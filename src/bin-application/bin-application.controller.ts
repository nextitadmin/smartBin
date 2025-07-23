import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { BinApplicationService } from './bin-application.service';
import { SmartBin } from '@models/smart-bin.model';
import { BinAppDto } from './dto/binAppDto';

@Controller('bin-application')
export class BinApplicationController {
    constructor(private readonly binApplicationService: BinApplicationService) {}
    
    // get all bin applications
    @Get()
    async getAllBinApplications(@Req() req, @Res() res) {
        const binApplications = await this.binApplicationService.getAllBinApplications();
        return res.status(200).json({
            message: 'Bin applications retrieved successfully',
            data: binApplications,
        });
    }
    
}
