import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Report, ReportType } from '@models/report.model';
import { CreateReportDto } from './dtos/report.dto';
import { SuccessResponse } from '@common/http';
import { AuthUser } from '@common/types';
import { Bill } from '@models/bill.model';
import { Transaction, TransactionStatus, ServiceType } from '@models/transaction.model';
import { SmartBin } from '@models/smart-bin.model';
import { Pickup } from '@models/pickup';

@Injectable()
export class ReportService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<Report>,
        @InjectModel(Bill.name) private readonly transactionModel: Model<Transaction>,
        @InjectModel(SmartBin.name) private readonly smartBinModel: Model<SmartBin>,
        @InjectModel(Pickup.name) private readonly pickupModel: Model<Pickup>,
    ) { }


    // generte report
    async generateReport(dto: CreateReportDto, user: AuthUser): Promise<SuccessResponse> {
        const { type } = dto;

        let data: any[] = [];
        if (type === ReportType.PaymentHistory) {
            data = await this.generatePaymentHistory(dto);
        } else if (type === ReportType.WastePickup) {
            data = await this.generateWastePickup(dto);
        } else if (type === ReportType.SmartBinRequest) {
            data = await this.generateSmartBinReport(dto);
        }

        const report = await this.reportModel.create({
            reportName: dto.reportName,
            type,
            filters: dto.filters,
            data,
            userId: new Types.ObjectId(user.id),
        });

        return {
            success: true,
            message: 'Report generated successfully',
            data: {
                id: report._id,
                reportName: report.reportName,
                type: report.type,
                generatedBy: user.email || user.id,
                generatedAt: report.createdAt,
                totalRecords: data.length,
            },
        };
    }

    // payment report
    private async generatePaymentHistory(dto: CreateReportDto): Promise<any[]> {
        const { filters, startDate, endDate } = dto;

        const query: any = {
            status: TransactionStatus.Successful,
            service: {
                $in: [
                    ServiceType.SmartBinPurchase,
                    ServiceType.WasteDisposal,
                    ServiceType.Subscription,
                    ServiceType.WalletTopUp,
                ],
            },
        };

        if (startDate && endDate) {
            query.completedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if (filters?.branch) {
            query['meta.branch'] = filters.branch;
        }

        const transactions = await this.transactionModel.find(query).lean();

        return transactions.map((txn) => ({
            transactionId: txn.transactionReference,
            receiptId: txn._id,
            service: txn.service,
            branch: txn.meta?.branch || 'N/A',
            amount: txn.amount,
            paymentMethod: txn.paymentMethod,
            paidAt: txn.completedAt,
        }));
    }

    // waste pickup report
    private async generateWastePickup(dto: CreateReportDto): Promise<any[]> {
        const { startDate, endDate, filters } = dto;

        const query: any = { ...filters };

        if (startDate && endDate) {
            query.nextPickupDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const records = await this.pickupModel.find(query).lean();

        return records.map((item, index) => ({
            sn: index + 1,
            pickupDate: item.nextPickupDate,
            address: item.address,
            status: item.status,
            amount: item.amount,
            orderId: item.wasteId,
            branch: item.branch || 'N/A',

        }));
    }

    // smartbin report
    private async generateSmartBinReport(dto: CreateReportDto): Promise<any[]> {
        const { filters, startDate, endDate } = dto;

        const query: any = {};

        if (startDate && endDate) {
            query.applicationHistory = {
                $elemMatch: {
                    timestamp: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            };
        }

        if (filters?.branch) {
            query.branch = filters.branch;
        }

        const applications = await this.smartBinModel.find(query).lean();

        return applications.map((app) => {
            const firstHistory = app.applicationHistory?.[0];
            return {
                orderId: app.transactionReference,
                dateRequested: firstHistory?.timestamp,
                address: app.address,
                branch: app.customerType === 'Corporate' ? app.branch : undefined,
                status: app.status,
            };
        });
    }

    // report dowmload
    async getReportById(reportId: string, user: AuthUser) {
        const report = await this.reportModel.findOne({
            _id: new Types.ObjectId(reportId),
            userId: new Types.ObjectId(user.id),
        }).lean();

        if (!report) {
            throw new NotFoundException('Report not found or you do not have permission to access it.');
        }

        return {
            id: report._id,
            type: report.type,
            generatedAt: report.createdAt,
            filters: report.filters,
            data: report.data,
        };
    }




    // report summary
    async getReportSummary(
        type: ReportType,
        user: AuthUser,
        page = 1,
        limit = 10,
    ) {
        if (type === ReportType.PaymentHistory) {
            return this.getPaymentSummary(user, page, limit);
        } else if (type === ReportType.WastePickup) {
            return this.getWastePickUpSummary(user, page, limit);
        } else if (type === ReportType.SmartBinRequest) {
            return this.getSmartBinSummary(user, page, limit);
        } else {
            throw new BadRequestException('Invalid report type');
        }
    }


    // payemnt summary
    private async getPaymentSummary(
        user: AuthUser,
        page: number,
        limit: number
    ) {
        const offset = (page - 1) * limit;
        const userId = new Types.ObjectId(user.id);

        const filter = {
            userId,
            type: ReportType.PaymentHistory,
        };

        const pipeline: PipelineStage[] = [
            { $match: filter },
            { $unwind: '$data' },
            {
                $facet: {
                    records: [
                        { $sort: { 'data.paidAt': -1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                transactionId: '$data.transactionId',
                                receiptId: '$data.receiptId',
                                service: '$data.service',
                                branch: '$data.branch',
                                amount: '$data.amount',
                                date: '$data.paidAt',
                                paymentMethod: '$data.paymentMethod',
                            },
                        },
                    ],
                    totalRecords: [{ $count: 'count' }],
                    totalAmount: [{ $group: { _id: null, amount: { $sum: '$data.amount' } } }],
                },
            },
        ];

        const [result] = await this.reportModel.aggregate(pipeline);

        const records = result.records || [];
        const totalRecords = result.totalRecords[0]?.count || 0;
        const totalAmount = result.totalAmount[0]?.amount || 0;

        return {
            reportType: ReportType.PaymentHistory,
            totalAmount,
            currentPage: page,
            perPage: limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            records,
        };
    }

    // waste summary
    async getWastePickUpSummary(user: AuthUser, page: number, limit: number): Promise<any> {
        const offset = (page - 1) * limit;
        const userId = new Types.ObjectId(user.id);

        const filter = {
            userId,
            type: ReportType.WastePickup,
        };
        const pipeline: PipelineStage[] = [
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 0,
                    wasteId: '$data.orderId',
                    address: '$data.address',
                    amount: '$data.amount',
                    status: '$data.status',
                    date: '$data.pickupDate',
                    branch: '$data.branch',
                    generatedAt: '$createdAt',
                },
            },
            {
                $facet: {
                    records: [{ $skip: offset }, { $limit: limit }],
                    totalRecords: [{ $count: 'count' }]
                }
            }
        ];

        const [result] = await this.reportModel.aggregate(pipeline) as any;
        const records = result.records || [];
        const totalDisposals = result.totalRecords[0]?.count || 0;

        return {
            reportType: ReportType.WastePickup,
            currentPage: page,
            perPage: limit,
            totalDisposals,
            totalPages: Math.ceil(totalDisposals / limit),
            records,
        };
    }
    // smartbin summary
    async getSmartBinSummary(user: AuthUser, page: number, limit: number): Promise<any> {
        const offset = (page - 1) * limit;
        const userId = new Types.ObjectId(user.id);

        const filter = {
            userId,
            type: ReportType.SmartBinRequest,
        };

        const pipeline: PipelineStage[] = [
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $unwind: '$data' },
            {
                $project: {
                    _id: 0,
                    orderId: '$data.orderId',
                    dateRequested: '$data.dateRequested',
                    address: '$data.address',
                    branch: '$data.branch',
                    status: '$data.status',
                    generatedAt: '$createdAt',
                },
            },
            {
                $facet: {
                    records: [{ $skip: offset }, { $limit: limit }],
                    totalRecords: [{ $count: 'count' }]
                }
            }
        ];

        const [result] = await this.reportModel.aggregate(pipeline) as any;
        const records = result.records || [];
        const totalRecords = result.totalRecords[0]?.count || 0;

        return {
            reportType: ReportType.SmartBinRequest,
            currentPage: page,
            perPage: limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            records,
        };
    }
}
