import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { PipelineStage } from 'mongoose';
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
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(TeamMember.name)
    private readonly teamMemberModel: Model<TeamMember>,
    @InjectModel(PSP.name) private readonly pspModel: Model<PSP>,
  ) { }

  // get super admin dashboard
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

    const totalRegisteredUsers =
      residentCount + agentCount + corporateCount + facilityManagerCount;

    const percentageByUserType = {
      resident: Math.floor((residentCount / totalRegisteredUsers) * 100) || 0,
      agent: Math.floor((agentCount / totalRegisteredUsers) * 100) || 0,
      corporate: Math.floor((corporateCount / totalRegisteredUsers) * 100) || 0,
      facilityManager:
        Math.floor((facilityManagerCount / totalRegisteredUsers) * 100) || 0,
      teamMember:
        Math.floor((totalTeamMembers / totalRegisteredUsers) * 100) || 0,
    };

    // Bin requests with breakdown by type and status
    const [
      pendingBinRequests,
      deliveredBinRequests,
      totalBinRequests,
      smartBinCount,
      nonSmartBinCount,
    ] = await Promise.all([
      this.smartbinModel
        .countDocuments({ status: SmartbinStatus.Pending })
        .exec(),
      this.smartbinModel
        .countDocuments({ status: SmartbinStatus.Delivered })
        .exec(),
      this.smartbinModel.countDocuments().exec(),
      this.smartbinModel.countDocuments({ binType: 'smart' }).exec(),
      this.smartbinModel.countDocuments({ binType: 'non_smart' }).exec(),
    ]);

    // Bin request status breakdown
    const binStatusBreakdown = await this.smartbinModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Revenue data - total, bin purchase, waste disposal
    const [totalRevenue, binPurchaseRevenue, wasteDisposalRevenue] = await Promise.all([
      this.getYearlyRevenue(new Date().getFullYear()),
      this.transactionModel.aggregate([
        {
          $match: { service: ServiceType.SmartBinPurchase, status: TransactionStatus.Successful },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        {
          $match: { service: ServiceType.WasteDisposal, status: TransactionStatus.Successful },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalPSPCompanies = await this.pspModel.countDocuments().exec();
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
        byType: {
          smart: smartBinCount,
          nonSmart: nonSmartBinCount,
          total: totalBinRequests,
        },
        byStatus: binStatusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        summary: {
          pending: pendingBinRequests,
          delivered: deliveredBinRequests,
          total: totalBinRequests,
        },
      },
      revenue: {
        total: totalRevenue,
        binPurchase: binPurchaseRevenue[0]?.total || 0,
        wasteDisposal: wasteDisposalRevenue[0]?.total || 0,
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

  // Helper function for yearly revenue
  private async getYearlyRevenue(year: number) {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          status: TransactionStatus.Successful,
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).exec();
    return result?.[0]?.total ?? 0;
  }

  // Get PSP revenue analysis with optional PSP filtering
  async getPspRevenueAnalysis(pspId?: string) {
    const matchStage: any = {
      $exists: true,
      $ne: null,
    };

    if (pspId) {
      matchStage.$eq = pspId;
    }

    const pipeline: PipelineStage[] = [
      {
        $match: {
          psp_id: matchStage,
          status: Status.Completed,
          transactionReference: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'transactionReference',
          foreignField: 'transactionReference',
          as: 'transactionData',
        },
      },
      { $unwind: { path: '$transactionData', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'transactionData.status': TransactionStatus.Successful,
        },
      },
      {
        $group: {
          _id: '$psp_id',
          revenue: { $sum: '$transactionData.amount' },
          totalPickups: { $sum: 1 },
          households: { $addToSet: '$accountId' },
        },
      },
      {
        $lookup: {
          from: 'psps',
          localField: '_id',
          foreignField: '_id',
          as: 'pspDetails',
        },
      },
      { $unwind: { path: '$pspDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          pspId: '$_id',
          pspName: '$pspDetails.company_name',
          revenue: 1,
          totalPickups: 1,
          householdsCovered: { $size: '$households' },
        },
      },
      { $sort: { revenue: -1 } },
    ];

    return this.pickupModel.aggregate(pipeline as unknown as PipelineStage[]).exec();
  }

  // Get household usage by LGA
  async getHouseholdByLga() {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'residents',
          localField: 'accountId',
          foreignField: '_id',
          as: 'residentData',
        },
      },
      { $unwind: { path: '$residentData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'lgas',
          localField: 'residentData.lga',
          foreignField: '_id',
          as: 'lgaData',
        },
      },
      { $unwind: { path: '$lgaData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            lga: '$lgaData.name',
            lgaId: '$lgaData._id',
          },
          totalHouseholds: { $addToSet: '$accountId' },
          binDelivered: {
            $sum: {
              $cond: [{ $eq: ['$status', Status.Completed] }, 1, 0],
            },
          },
          wastePickedUp: { $sum: 1 },
        },
      },
      {
        $project: {
          lgaName: '$_id.lga',
          lgaId: '$_id.lgaId',
          householdsCovered: { $size: '$totalHouseholds' },
          binDelivered: 1,
          wastePickedUp: 1,
        },
      },
      { $sort: { householdsCovered: -1 } },
    ];

    return this.pickupModel.aggregate(pipeline as unknown as PipelineStage[]).exec();
  }
}
