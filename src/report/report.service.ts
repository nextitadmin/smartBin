import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportType } from '@models/report.model';
import { CreateReportDto, CustomerType, GetReportsDto, CreateAdminReportDto } from './dtos/report.dto';
import { SuccessResponse } from '@common/http';
import { AuthUser } from '@common/types';
import {
    Transaction,
    ServiceType,
    TransactionStatus,
} from '@models/transaction.model';
import { SmartBin } from '@models/smart-bin.model';
import { Pickup, PickupDocument } from '@models/pickup';
import moment from 'moment';
import { Resident } from '@models/users/resident.model';
import { Corporate } from '@models/users/corporate.model';
import { UserRole } from '@models/types';
import { Agent } from '@models/users/agent.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { FacilityUsers } from '@models/facility-users.model';

@Injectable()
export class ReportService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<Report>,
        @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
        @InjectModel(SmartBin.name) private readonly smartBinModel: Model<SmartBin>,
        @InjectModel(Pickup.name) private readonly pickupModel: Model<PickupDocument>,
        @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
        @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
        @InjectModel(FacilityManager.name) private readonly facilityManagerModel: Model<FacilityManager>,
        // @InjectModel(FacilityUsers.name) private readonly facilityModel: Model<FacilityUsers>,
        @InjectModel(Corporate.name) private readonly corporateModel: Model<Corporate>,
    ) { }

    // generte report
    async generateReport(
        dto: CreateReportDto,
        user: AuthUser,
    ): Promise<SuccessResponse> {
        const { type, customerType, customerName } = dto;
        if (customerType && customerName) {
            const [firstName, lastName] = customerName.trim().split(' ');

            let customerRecord = null;

            if (customerType === CustomerType.Resident) {
                customerRecord = await this.residentModel
                    .findOne({ firstName, lastName })
                    .lean();
            } else if (customerType === CustomerType.Corporate) {
                customerRecord = await this.corporateModel
                    .findOne({ firstName, lastName })
                    .lean();
            }

            if (!customerRecord) {
                throw new NotFoundException(
                    `No ${customerType} found with name ${customerName}`
                );
            }
        }


        let data: any;
        if (type === ReportType.PaymentHistory) {
            data = await this.generatePaymentHistory(user, dto);
        } else if (type === ReportType.WastePickup) {
            data = await this.generateWastePickup(user, dto);
        } else if (type === ReportType.SmartBinRequest) {
            data = await this.generateSmartBinReport(user, dto);
        }

        const report = await this.reportModel.create({
            reportName: dto.reportName,
            type,
            filters: dto.filters,
            customerType: dto.customerType,
            customerName: dto.customerName,
            data,
            period: {
                from: moment(dto.startDate).format('DD/MM'),
                to: moment(dto.endDate).format('DD/MM'),
            },
            userId: new Types.ObjectId(user.id),
        });

        return {
            success: true,
            message: 'Report generated successfully',
            data: {
                id: report._id,
                reportName: report.reportName,
                customerName: report?.customerName,
                reportFor: `Report for ${report?.customerName}`,
                customerType: report?.customerType,
                type: report.type,
                generatedBy: user.email || user.id,
                generatedAt: report.createdAt,
                period: {
                    from: moment(dto.startDate).format('DD/MM'),
                    to: moment(dto.endDate).format('DD/MM'),
                },
                totalRecords: data.length,
            },
        };
    }



    private async generatePaymentHistory(user: AuthUser, dto: CreateReportDto):
        Promise<{
            records: any[];
            chartSummary: {
                totalPayment: number;
                breakdown: {
                    [service: string]:
                    { totalAmount: number; percentage: number; };
                };
            };
        }> {
        const { filters, startDate, endDate } = dto;

        const query: any = {
            userId: user.id,
            service: {
                $in: [
                    ServiceType.SmartBinPurchase,
                    ServiceType.WasteDisposal,
                    ServiceType.Subscription,
                    ServiceType.WalletTopUp,
                ],
            },
            status: TransactionStatus.Successful,
        };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if (filters?.branch) {
            query['meta.branch'] = filters.branch;
        }

        const transactions = await this.transactionModel.find(query).lean();

        const summaryMap: Record<string, { totalAmount: number }> = {
            [ServiceType.SmartBinPurchase]: { totalAmount: 0 },
            [ServiceType.WasteDisposal]: { totalAmount: 0 },
            [ServiceType.Subscription]: { totalAmount: 0 },
            [ServiceType.WalletTopUp]: { totalAmount: 0 },
        };

        let totalPayment = 0;

        const records = transactions.map((txn) => {
            const { service, amount } = txn;
            if (summaryMap[service]) {
                summaryMap[service].totalAmount += amount;
            }
            totalPayment += amount;

            return {
                transactionId: txn.transactionReference,
                receiptId: txn._id,
                service,
                branch: txn.meta?.branch,
                tenantName: txn.meta?.tenantName,
                businessName: txn.meta?.businessName,
                amount,
                paymentMethod: txn.paymentMethod,
                paidAt: txn.createdAt,
            };
        });

        const chartSummary = {
            totalPayment,
            breakdown: {} as Record<
                string,
                { totalAmount: number; percentage: number }
            >,
        };

        for (const service in summaryMap) {
            const serviceTotal = summaryMap[service].totalAmount;
            chartSummary.breakdown[service] = {
                totalAmount: serviceTotal,
                percentage: totalPayment > 0 ? Math.round((serviceTotal / totalPayment) * 100) : 0,
            };
        }

        return {
            records,
            chartSummary,
        };
    }


    // waste pickup report
    private async generateWastePickup(
        user: AuthUser,
        dto: CreateReportDto,
    ): Promise<{ pickups: any[]; summary: { totalPickups: number; totalWeight: number; }; }> {
        const { startDate, endDate, filters } = dto;

        const query: any = {
            accountId: new Types.ObjectId(user.id),
        };

        if (filters?.branch) {
            query.branch = filters.branch;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const records = await this.pickupModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();
        let totalWeight = 0;

        const pickups = records.map((item, index) => {
            const weight = item.weight || 0;

            totalWeight += weight;

            return {
                sn: index + 1,
                pickupDate: item.pickupDate,
                pickupTime: item.pickupTime,
                customerName: item?.customerName,
                phoneNumber: item?.phoneNumber,
                address: item.address,
                status: item.status,
                weight,
                orderId: item.wasteId,
                branch: item?.branch,
                tenantName: item?.customerName,
                businessName: item?.representative


            };
        });

        return {
            pickups,
            summary: {
                totalPickups: records.length,
                totalWeight,
            },
        };
    }


    private async generateSmartBinReport(user: AuthUser, dto: CreateReportDto):
        Promise<{ records: any[]; totalApplications: number; }> {
        const { filters, startDate, endDate } = dto;

        const query: any = {
            userId: new Types.ObjectId(user.id),
        };

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

        const records = applications.map((app) => {
            const firstHistory = app.applicationHistory?.[0];
            return {
                orderId: app.transactionReference,
                dateRequested: firstHistory?.timestamp,
                address: app.address,
                branch: app?.branch,
                tenantName: app?.name,
                businessName: app?.businessName,
                status: app.status,
            };
        });

        return {
            records,
            totalApplications: applications.length,
        };
    }



    // report dowmload
    async getReportById(reportId: string, user: AuthUser) {
        const report = await this.reportModel
            .findOne({
                _id: new Types.ObjectId(reportId),
                userId: new Types.ObjectId(user.id),
            })
            .lean();

        if (!report) {
            throw new NotFoundException(
                'Report not found or you do not have permission to access it.',
            );
        }

        return {
            id: report._id,
            type: report.type,
            reportName: report.reportName,
            period: report.period,
            tenantName: report?.tenantName,
            businessName: report?.businessName,
            customerName: report?.customerName,
            customerType: report?.customerType,
            generatedAt: report.createdAt,
            filters: report.filters,
            data: report.data,
        };
    }




    async getReportsByUser(user: AuthUser, filters: GetReportsDto) {
        const query: any = {
            userId: new Types.ObjectId(user.id),
        };

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.startDate && filters.endDate) {
            query.createdAt = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate),
            };
        }

        if (filters.search) {
            query.reportName = { $regex: filters.search, $options: 'i' };
        }

        const reports = await this.reportModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();

        return reports.map((report, index) => ({
            sn: index + 1,
            title: report.reportName,
            reportType: report.type,
            generationDate: report.createdAt,
            period: {
                from: moment(filters.startDate).format('DD/MM'),
                to: moment(filters.endDate).format('DD/MM'),
            },

            ...report,
        }));
    }





    // admin report
    async generateAdminReport(
        adminId: string,
        dto: CreateAdminReportDto,
    ): Promise<SuccessResponse> {
        const { type } = dto;

        let data: any;
        if (type === ReportType.Revenue) {
            data = await this.adminRevenueReport(dto);
        } else if (type === ReportType.WastePickup) {
            data = await this.adminWasteDisposalReport(dto);
        } else if (type === ReportType.SmartBinRequest) {
            data = await this.adminSmartbinReport(dto);
        }

        const report = await this.reportModel.create({
            adminId,
            reportName: dto.reportName,
            type,
            lga: dto.lga,
            filters: dto.filters,
            data,
            period: {
                from: moment(dto.startDate).format('DD/MM'),
                to: moment(dto.endDate).format('DD/MM'),
            },
        });

        return {
            success: true,
            message: 'Report generated successfully',
            data: {
                id: report._id,
                reportName: report.reportName,
                type: report.type,
                generatedBy: report.adminId,
                generatedAt: report.createdAt,
                period: {
                    from: moment(dto.startDate).format('DD/MM'),
                    to: moment(dto.endDate).format('DD/MM'),
                },
                totalRecords: data.length,
            },
        };
    }


    async adminSmartbinReport(dto: CreateAdminReportDto) {
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

        const records = applications.map((app) => {
            const firstHistory = app.applicationHistory?.[0];
            return {
                orderId: app.transactionReference,
                dateRequested: firstHistory?.timestamp,
                address: app.address,
                branch: app?.branch,
                tenantName: app?.name,
                businessName: app?.businessName,
                status: app.status,
            };
        });

        return {
            records,
            totalApplications: applications.length,
        };
    }


    async adminWasteDisposalReport(dto: CreateAdminReportDto) {
        const { startDate, endDate, filters } = dto;

        const query: any = {};

        if (filters?.branch) {
            query.branch = filters.branch;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const records = await this.pickupModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();
        let totalWeight = 0;

        const pickups = records.map((item) => {
            
            const weight = item.weight || 0;

            totalWeight += weight;

            return {
                pickupDate: item.pickupDate,
                pickupTime: item.pickupTime,
                customerName: item?.customerName,
                phoneNumber: item?.phoneNumber,
                address: item.address,
                status: item.status,
                weight,
                wasteId: item.id,
                branch: item?.branch,
                tenantName: item?.customerName,
                businessName: item?.representative,
            };
        });

        return {
            pickups,
            summary: {
                totalPickups: records.length,
                totalWeight,
            },
        };
    }



    async adminRevenueReport(dto: CreateAdminReportDto) {
    const { filters, startDate, endDate } = dto;

    const query: any = {
        status: TransactionStatus.Successful,
    };

    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    if (filters?.branch) {
        query['meta.branch'] = filters.branch;
    }

    const transactions = await this.transactionModel.find(query).lean();

    const serviceSummary: Record<string, number> = {
        [ServiceType.SmartBinPurchase]: 0,
        [ServiceType.WasteDisposal]: 0,
        [ServiceType.Subscription]: 0,
        [ServiceType.WalletTopUp]: 0,
    };

    const userTypeSummary: Record<string, number> = {
        [UserRole.Resident]: 0,
        [UserRole.Corporate]: 0,
        [UserRole.Agent]: 0,
        [UserRole.Facility]: 0,
    };

    let totalRevenue = 0;

    const records = transactions.map((txn) => {
        const { service, amount, userType } = txn;

        if (serviceSummary.hasOwnProperty(service)) {
            serviceSummary[service] += amount;
        }

        if (userTypeSummary.hasOwnProperty(userType)) {
            userTypeSummary[userType] += amount;
        }

        totalRevenue += amount;

        return {
            txn
        };
    });

    return {
        records,
        chartSummary: {
            totalRevenue,
            byServiceType: Object.entries(serviceSummary).map(([service, totalAmount]) => ({
                service,
                totalAmount,
            })),
            byUserType: Object.entries(userTypeSummary).map(([type, totalAmount]) => ({
                userType: type,
                totalAmount,    
            })),
        },
    };
}


    async getAdminReports(adminId: string, filters: GetReportsDto ) {
        const query: any = { adminId };

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.startDate && filters.endDate) {
            query.createdAt = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate),
            };
        }

        if (filters.search) {
            query.reportName = { $regex: filters.search, $options: 'i' };
        }

        const reports = await this.reportModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();

        return reports.map((report) => ({
            title: report.reportName,
            reportType: report.type,
            generationDate: report.createdAt,
            period: {
                from: moment(report.startDate).format('DD/MM'),
                to: moment(report.endDate).format('DD/MM'),
            },
        }));
    }


    async getAdminReportById(reportId: string,adminId: string) {
        const report = await this.reportModel
            .findOne({
                _id: reportId,
                adminId: adminId,
            })
            .lean();

        if (!report) {
            throw new NotFoundException(
                'Report not found.',
            );
        }

        return {
            report
            // id: report._id,
            // type: report.type,
            // reportName: report.reportName,
            // period: report.period,
            // tenantName: report?.tenantName,
            // businessName: report?.businessName,
            // customerName: report?.customerName,
            // customerType: report?.customerType,
            // generatedAt: report.createdAt,
            // filters: report.filters,
            // data: report.data,
        };
    }

}
