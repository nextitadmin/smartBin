// dashboard.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { SmartBin } from '@models/smart-bin.model';
import { Transaction } from '@models/transaction.model';
import { Pickup, Status } from '@models/pickup';
import { PickupStatus, UserRole } from '@models/types';
import { formatCustomDate, formatTimestamp } from '@common/utils';
import { TeamMember } from '@models/team.model';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Corporate.name)
    private readonly corporateModel: Model<Corporate>,
    @InjectModel(FacilityManager.name)
    private readonly facilityModel: Model<FacilityManager>,
    @InjectModel(Bill.name) private readonly billModel: Model<Bill>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(SmartBin.name) private readonly smartbinModel: Model<SmartBin>,
    @InjectModel(Pickup.name) private readonly pickupModel: Model<Pickup>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMember>
  ) { }

    async getAdminDashboard(queryYear: number) {
        const [residentCount, agentCount, corporateCount, facilityManagerCount, totalTeamMembers] = await Promise.all([
                this.residentModel.countDocuments().exec(),
                this.agentModel.countDocuments().exec(),
                this.corporateModel.countDocuments().exec(),
                this.facilityModel.countDocuments().exec(),
                this.smartbinModel.countDocuments().exec(),
                this.teamMemberModel.countDocuments().exec()
            ]);
        
            const pendingBinrequests = await this.smartbinModel.countDocuments({ status: 'pending' }).exec();
            const completedBinrequests = await this.smartbinModel.countDocuments({ status: 'completed' }).exec();
            const totalBinRequests = await this.smartbinModel.countDocuments().exec();
            const totalRegisteredUsers = residentCount + agentCount + corporateCount + facilityManagerCount + totalTeamMembers;

        return {
            registeredUsers: {
                residentUsers: residentCount,
                agentsUsers: agentCount,
                corporatesUsers: corporateCount,
                facilityManagers: facilityManagerCount,
                totalRegisteredUsers: totalRegisteredUsers,
            },
            binRequests: {
                pending: pendingBinrequests,
                completed: completedBinrequests,
                totalBinRequest: totalBinRequests
            },
            pspCompanies: {
                registeredPSPs: 0 ,
                topPspCompanies: [],
            }
        };
    }

    async getRevenueOverview(queryYear: number):Promise<{
        totalAmountGeneratedOvertime: number;
        totalRevenuePerYear: any[];
        smartbinApp: { revenue: number; totalTransactions: number };
        pickupApp: { revenue: number; totalTransactions: number };
        paymentDetails: any[];
        }> {
        const [
            [amountResult],
            totalRevenuePerYear,
            [smartbinRevenue],
            [pickupRevenue],
            paymentDetails
        ] = await Promise.all([
            this.transactionModel.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]),
            this.transactionModel.aggregate([
            {
                $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
            this.transactionModel.aggregate([
            { $match: { revenueSource: "Smart Bin" } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
            ]),
            this.transactionModel.aggregate([
            { $match: { revenueSource: "Waste Collection" } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
            ]),
            this.transactionModel.find({},  { paymentId: 1, revenueSource: 1, amount: 1, createdAt: 1, paymentMethod: 1, status: 1 })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        ]);

        const totalAmountGeneratedOvertime = amountResult?.totalAmount || 0;

        return {
            totalAmountGeneratedOvertime,
            totalRevenuePerYear,
            smartbinApp: {
            revenue: smartbinRevenue?.total || 0,
            totalTransactions: smartbinRevenue?.count || 0,
            },
            pickupApp: {
            revenue: pickupRevenue?.total || 0,
            totalTransactions: pickupRevenue?.count || 0,
            },
            paymentDetails
        };
    }


}