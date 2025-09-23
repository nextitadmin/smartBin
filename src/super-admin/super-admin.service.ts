import { Injectable } from '@nestjs/common';
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
import { TeamMember } from '@models/team.model';
import { UserRole } from '@models/types';
import { Paging } from '@common/http';
import { PSP } from '@models/psp.model';
import { AdministratorRole } from '@models/administrator.model';
@Injectable()
export class SuperAdminService {
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
        @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMember>,
        @InjectModel(PSP.name) private readonly pspModel: Model<PSP>,
    ) { }

    // get super admin dashboard
    async getSuperAdminDashboard() {
        const [residentCount, agentCount, corporateCount, facilityManagerCount, totalTeamMembers] = await Promise.all([
            this.residentModel.countDocuments().exec(),
            this.agentModel.countDocuments().exec(),
            this.corporateModel.countDocuments().exec(),
            this.facilityModel.countDocuments().exec(),
            this.teamMemberModel.countDocuments().exec()
        ]);

        const pendingBinrequests = await this.smartbinModel.countDocuments({ status: 'pending' }).exec();
        const completedBinrequests = await this.smartbinModel.countDocuments({ status: 'completed' }).exec();
        const totalBinRequests = await this.smartbinModel.countDocuments().exec();
        const totalRegisteredUsers = residentCount + agentCount + corporateCount + facilityManagerCount + totalTeamMembers;

        const totalPSPCompanies = await this.pspModel.countDocuments().exec();
        const topPSPcompanies = await this.pspModel.find().sort({ createdAt: -1 }).limit(5).lean();

        return {
            registeredUsers: {
                residentUsers: residentCount,
                agentsUsers: agentCount,
                corporatesUsers: corporateCount,
                facilityManagers: facilityManagerCount,
                totalRegisteredUsers: totalRegisteredUsers,
            },
            binRequests: {
                pendingBinrequests: pendingBinrequests,
                completedBinrequests: completedBinrequests,
                totalBinRequests: totalBinRequests,
            },
            totalTeamMembers: totalTeamMembers,
            pspCompanies: {
                registeredPSPs: totalPSPCompanies,
                topPSPcompanies: topPSPcompanies,
            }
        };
    }

    // get Revenue Overview
    async getRevenueOverview() {
        const totalAmount = await this.transactionModel.find().lean();
        const totalAmountGeneratedOvertime = totalAmount.reduce((sum, transaction) => sum + transaction.amount, 0);

        const currentYear = new Date().getFullYear();
        const totalRevenuePerYear = await this.transactionModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);
        const [smartbinStats] = await this.transactionModel.aggregate([
            { $match: { service: 'SmartBinPurchase' } },
            {
            $group: {
                _id: null,
                revenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
            },
            },
        ]);
        const [pickupStats] = await this.transactionModel.aggregate([
            { $match: { service: 'WasteDisposal' } },
            {
            $group: {
                _id: null,
                revenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
            },
            },
        ]);
        const paymentDetails = await this.transactionModel
            .find({},{transactionReference: 1,service: 1,amount: 1,createdAt: 1,paymentMethod: 1,status: 1, },
        )
        .sort({ createdAt: -1 })
        .lean();
        return {
            totalAmountGeneratedOvertime,
            totalRevenuePerYear,
            smartbinApp: {
                revenue: smartbinStats?.revenue,
                totalTransactions: smartbinStats?.totalTransactions,
                },
            pickupApp: {
                revenue: pickupStats?.revenue,
                totalTransactions: pickupStats?.totalTransactions,
                },
            paymentDetails
        };

    }
}
