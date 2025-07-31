// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Query,
//   Param,
//   UseGuards,
// } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { Types } from 'mongoose';


// import { ReportService } from './report.service';
// import { CreateReportDto, GetReportsDto } from './dtos/report.dto';

// @ApiTags('Report')
// @ApiBearerAuth('access-token')
// @UseGuards(AuthGuard)
// @Controller({
//   path: 'reports',
//   version: '1',
// })
// export class ReportController {
//   constructor(private readonly reportService: ReportService) {}

//   @Post()
//   createReport(
//     @Actor() user: { userId: string },
//     @Body() createReportDto: CreateReportDto,
//   ) {
//     const userId = new Types.ObjectId(user.userId);
//     return this.reportService.createReport(userId, createReportDto);
//   }

//   @Get()
//   getReports(
//     @Actor() user: { userId:string },
//     @Query() getReportsDto: GetReportsDto,
//   ) {
//     const userId = new Types.ObjectId(user.userId);
//     return this.reportService.getReports(userId, getReportsDto);
//   }

// //   @Get(':id')
// //   getReportById(@Actor() user: { userId: string }, @Param('id') id: string) {
// //     const userId = new Types.ObjectId(user.userId);
// //     return this.reportService.getReportById(userId, id);
// //   }
// }