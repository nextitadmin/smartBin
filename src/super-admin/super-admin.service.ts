import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { SmartBin, SmartbinStatus } from '@models/smart-bin.model';
import { ServiceType, Transaction, TransactionStatus } from '@models/transaction.model';
import { Pickup, Status } from '@models/pickup';
import { TeamMember } from '@models/team.model';
import { UserRole } from '@models/types';
import { Paging } from '@common/http';
import { PSP } from '@models/psp.model';
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
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(TeamMember.name)
    private readonly teamMemberModel: Model<TeamMember>,
    @InjectModel(PSP.name) private readonly pspModel: Model<PSP>,
  ) { }

  async getSuperAdminDashboard() {
    const [
      residentCount,
      agentCount,
      corporateCount,
      facilityManagerCount,
      totalTeamMembers,
    ] = await Promise.all([
      this.residentModel.countDocuments().exec(),
      this.agentModel.countDocuments().exec(),
      this.corporateModel.countDocuments().exec(),
      this.facilityModel.countDocuments().exec(),
      this.teamMemberModel.countDocuments().exec(),
    ]);

    const pendingBinrequests = await this.smartbinModel
      .countDocuments({ status: SmartbinStatus.Pending })
      .exec();
    const completedBinrequests = await this.smartbinModel
      .countDocuments({ status: SmartbinStatus.Delivered })
      .exec();
    const totalBinRequests = await this.smartbinModel.countDocuments().exec();

    const totalRegisteredUsers =
      residentCount + agentCount + corporateCount + facilityManagerCount;
    totalTeamMembers;
    const percentageByUserType = {
      resident: Math.floor((residentCount / totalRegisteredUsers) * 100) || 0,
      agent: Math.floor((agentCount / totalRegisteredUsers) * 100) || 0,
      corporate: Math.floor((corporateCount / totalRegisteredUsers) * 100) || 0,
      facilityManager:
        Math.floor((facilityManagerCount / totalRegisteredUsers) * 100) || 0,
      teamMember:
        Math.floor((totalTeamMembers / totalRegisteredUsers) * 100) || 0,
    };

    const totalPSPCompanies = await this.pspModel.countDocuments().exec();
    // TODO: Add top PSP companies per revenue generated. @Kazeem
    const topPSPcompanies = await this.pspModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      registeredUsers: {
        residentUsers: residentCount,
        agentsUsers: agentCount,
        corporatesUsers: corporateCount,
        facilityManagers: facilityManagerCount,
        totalRegisteredUsers: totalRegisteredUsers,
        percentageByUserType: percentageByUserType,
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
      },
    };
  }

  // Lawma Admin
  async getLawmaAdminDashboard() {
    const [
      residentCount,
      agentCount,
      corporateCount,
      facilityManagerCount,
    ] = await Promise.all([
      this.residentModel.countDocuments().exec(),
      this.agentModel.countDocuments().exec(),
      this.corporateModel.countDocuments().exec(),
      this.facilityModel.countDocuments().exec(),
    ]);

    const totalRegisteredUsers =
      residentCount + agentCount + corporateCount + facilityManagerCount;

    const percentageByUserType = {
      resident: Math.floor((residentCount / totalRegisteredUsers) * 100) || 0,
      agent: Math.floor((agentCount / totalRegisteredUsers) * 100) || 0,
      corporate: Math.floor((corporateCount / totalRegisteredUsers) * 100) || 0,
      facilityManager:
        Math.floor((facilityManagerCount / totalRegisteredUsers) * 100) || 0,
    };

    const totalPSPCompanies = await this.pspModel.countDocuments().exec();

    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    // Helper function for yearly aggregation
    const getYearlyRevenue = async (year: number) => {
      const result = await this.transactionModel.aggregate([
        {
          $match: {
            status: TransactionStatus.Successful,
            service: {
              $in: [ServiceType.WasteDisposal, ServiceType.SmartBinPurchase],
            },
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${year + 1}-01-01`),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).exec();
      return result?.[0]?.total ?? 0;
    };

    const [currentYearRevenue, lastYearRevenue] = await Promise.all([
      getYearlyRevenue(currentYear),
      getYearlyRevenue(lastYear),
    ]);

    const annualRevenueGrowth =
      lastYearRevenue > 0
        ? (((currentYearRevenue - lastYearRevenue) / lastYearRevenue) * 100).toFixed(2) + "%"
        : "100%";

    const monthlyRevenueData = await this.transactionModel.aggregate([
      {
        $match: {
          status: TransactionStatus.Successful,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]).exec();

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = monthlyRevenueData.find(m => m._id.month === i + 1);
      return month ? month.revenue : 0;
    });

    const topPSPcompanies = await this.pspModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "psp-users",
          localField: "_id",
          foreignField: "psp_id",
          as: "team_members",
        },
      },
      {
        $addFields: {
          teamMembersCount: { $size: "$team_members" },
        },
      },
      {
        $project: {
          _id: 1,
          company_name: 1,
          teamMembersCount: 1,
        },
      },
    ]).exec();

    const [pendingBinrequests, completedBinrequests, totalBinRequests] =
      await Promise.all([
        this.smartbinModel
          .countDocuments({ status: SmartbinStatus.Pending })
          .exec(),
        this.smartbinModel
          .countDocuments({ status: SmartbinStatus.Delivered })
          .exec(),
        this.smartbinModel.countDocuments().exec(),
      ]);
    return {
      registeredUsers: {
        resident: residentCount,
        agent: agentCount,
        corporate: corporateCount,
        facilityManager: facilityManagerCount,
        total: totalRegisteredUsers,
        percentageByUserType,
      },
      binRequests: {
        pending: pendingBinrequests,
        completed: completedBinrequests,
        total: totalBinRequests,
      },
      psp: {
        total: totalPSPCompanies,
        topCompanies: topPSPcompanies,
      },
      revenue: {
        total: currentYearRevenue,
        monthlyRevenue,
        annualGrowth: annualRevenueGrowth,
      },
    };
  }

  // get Revenue Overview
  async getRevenueOverview(currentYear: number = new Date().getFullYear()) {
    const totalAmount = await this.transactionModel.find().lean();
    const totalAmountGeneratedOvertime = totalAmount.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    const totalRevenuePerYear = await this.transactionModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);
    const [smartbinStats] = await this.transactionModel.aggregate([
      { $match: { service: ServiceType.SmartBinPurchase } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);
    const [pickupStats] = await this.transactionModel.aggregate([
      { $match: { service: ServiceType.WasteDisposal } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);
    const paymentDetails = await this.transactionModel
      .find(
        {},
        {
          transactionReference: 1,
          service: 1,
          amount: 1,
          createdAt: 1,
          paymentMethod: 1,
          status: 1,
        },
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
      paymentDetails,
    };
  }
}