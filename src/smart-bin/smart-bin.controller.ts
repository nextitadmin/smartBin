import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BinApplicationService } from './smart-bin.service';
import { SmartBin } from '@models/smart-bin.model';
import { BinAppDto } from './dto/binAppDto';
import { AgentAuth } from '@common/decorators/auth.decorator';

@Controller('smart-bin')
export class BinApplicationController {
  constructor(private readonly binApplicationService: BinApplicationService) {}

  @Get()
  async getbinApplication(@Req() req) {
    const { userId, userType } = req.user;

    switch (userType) {
      case 'Resident':
        return this.binApplicationService.getResidentBinApplication(userId);

      case 'Facility':
        return this.binApplicationService.getFacilityManagerBinApplication(
          userId,
        );

      case 'Agent':
        return this.binApplicationService.getAgentBinApplication(userId);

      case 'Corporate':
        return this.binApplicationService.getCorporateBinApplication(userId);

      default:
        return {
          message: 'Unknown user type. Cannot fetch Bin.',
        };
    }
  }

  @Get('all-bin')
  @UseGuards(AgentAuth)
  async getAllBinApplications(@Req() req, @Res() res) {
    const { userId, userType } = req.user;

    if (userType !== 'Agent') {
      return res.status(403).json({
        message: 'Access denied. Only agents can view all bin applications.',
      });
    }

    const allBinApplications: SmartBin[] =
      await this.binApplicationService.getAllBinApplications();
    return res.status(200).json({
      message: 'All bin applications retrieved successfully',
      allBinApplications,
    });
  }

  // Get bin By Id
  @Get(':id')
  @AgentAuth()
  async getBinApplicationById(@Req() req, @Res() res) {
    const binId = req.params.id;

    const binApplication: SmartBin =
      await this.binApplicationService.getBinApplicationById(binId);
    if (!binApplication) {
      return res.status(404).json({ message: 'Bin application not found' });
    }

    return res.status(200).json({
      message: 'Bin application retrieved successfully',
      binApplication,
    });
  }

  // Get bin application by userId
  @Get('user/:userId')
  @AgentAuth()
  async getBinApplicationByUserId(@Req() req, @Res() res) {
    const UserId = req.params.userId;
    const binApplications: SmartBin[] =
      await this.binApplicationService.getBinApplicationsByUserId(UserId);
    if (!binApplications || binApplications.length === 0) {
      return res
        .status(404)
        .json({ message: 'Bin applications not found for this user' });
    }
    return res.status(200).json({
      message: 'Bin applications retrieved successfully for this user',
      binApplications,
    });
  }

  // create bin application
  @Post('create-bin')
  @AgentAuth()
  async createBinApplication(
    @Body() binAppDto: BinAppDto,
    @Req() req,
    @Res() res,
  ) {
    const { userId, userType } = req.user;

    const binApplication: SmartBin =
      await this.binApplicationService.createBinApplication(
        binAppDto,
        userId,
        userType,
      );
    return res.status(201).json({
      message: 'Bin application created successfully',
      binApplication,
    });
  }
  // update bin application
  @Post('update-bin')
  @AgentAuth()
  async updateBinApplication(
    @Body() binAppDto: BinAppDto,
    @Req() req,
    @Res() res,
  ) {
    const { userId, userType } = req.user;

    const updatedBinApplication: SmartBin =
      await this.binApplicationService.updateBinApplicationStatus(
        binAppDto.userId,
        binAppDto.status,
      );
    return res.status(200).json({
      message: 'Bin application updated successfully',
      updatedBinApplication,
    });
  }
  // delete bin application
  @Post('delete-bin')
  @AgentAuth()
  async deleteBinApplication(
    @Body() binAppDto: BinAppDto,
    @Req() req,
    @Res() res,
  ) {
    const { userId, userType } = req.user;

    const result = await this.binApplicationService.deleteBinApplication(
      binAppDto.userId,
    );
    return res
      .status(200)
      .json({ message: 'Bin application deleted successfully', ...result });
  }
}
