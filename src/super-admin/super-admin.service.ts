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
import { Paging, SuccessResponse } from '@common/http';
import { PSP } from '@models/psp.model';
import { Lga } from '@models/lgas.model';
import { PspService } from '../lawma/psp/psp.service';
import { CreatePspDTO, ChangeStatusPspDto } from '../lawma/psp/dto/psp.dto';
import { PickupService } from '@src/waste-management/pickup/pickup.service';
import { AdminUser, PspUser } from '@common/types';
import { GetPickupsForPspDto } from '@src/waste-management/pickup/dto/pickup.dto';
import { RevenueOverviewDto } from './dto';

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
    @InjectModel(Lga.name) private readonly lgaModel: Model<Lga>,
    private readonly pspService: PspService,
    private readonly pickupService:PickupService
    
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


  async getRevenue(filters?: RevenueOverviewDto) {
  const currentYear = filters?.year || new Date().getFullYear();
  const previousYear = currentYear - 1;
  const { page = 1, limit = 10 } = filters || {};
  const skip = (page - 1) * limit;

  // 1. Total amount generated overtime (all successful transactions)
  const [totalAmountResult] = await this.transactionModel.aggregate([
    { $match: { status: TransactionStatus.Successful } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalAmountGeneratedOvertime = totalAmountResult?.total || 0;

  // 2. Smart Bin revenue (total)
  const [smartBinStats] = await this.transactionModel.aggregate([
    {
      $match: {
        service: ServiceType.SmartBinPurchase,
        status: TransactionStatus.Successful,
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  // 3. PSP/Waste Disposal revenue (total)
  const [pspStats] = await this.transactionModel.aggregate([
    {
      $match: {
        service: ServiceType.WasteDisposal,
        status: TransactionStatus.Successful,
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  // 4. Current year total revenue
  const [currentYearTotal] = await this.transactionModel.aggregate([
    {
      $match: {
        status: TransactionStatus.Successful,
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // 5. Previous year total revenue (for comparison percentage)
  const [previousYearTotal] = await this.transactionModel.aggregate([
    {
      $match: {
        status: TransactionStatus.Successful,
        createdAt: {
          $gte: new Date(`${previousYear}-01-01`),
          $lt: new Date(`${currentYear}-01-01`),
        },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const currentYearRevenue = currentYearTotal?.total || 0;
  const previousYearRevenue = previousYearTotal?.total || 0;

  // Calculate year-over-year percentage change
  const percentageChange =
    previousYearRevenue > 0
      ? (((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100).toFixed(1)
      : 0;

  // 6. Monthly revenue breakdown for the selected year (combined SmartBin + WasteDisposal)
  const monthlyRevenue = await this.transactionModel.aggregate([
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
        _id: { month: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
        smartBinRevenue: {
          $sum: {
            $cond: [{ $eq: ['$service', ServiceType.SmartBinPurchase] }, '$amount', 0],
          },
        },
        wasteDisposalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$service', ServiceType.WasteDisposal] }, '$amount', 0],
          },
        },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((month, index) => {
    const found = monthlyRevenue.find((r) => r._id.month === index + 1);
    return {
      month,
      total: found?.total || 0,
      smartBinRevenue: found?.smartBinRevenue || 0,
      wasteDisposalRevenue: found?.wasteDisposalRevenue || 0,
    };
  });

  const pspRevenue = await this.pickupService.getPspRevenueForAdmin()
  const [pspCountResult] = await this.pickupModel.aggregate([
    {
      $match: {
        status: Status.Completed,
        pspId: { $exists: true, $ne: null },
      },
    },
    { $group: { _id: '$pspId' } },
    { $count: 'total' },
  ]);
  const totalPspCount = pspCountResult?.total || 0;

  return {
    totalAmountGeneratedOvertime,
    smartBinSuppliers: {
      revenue: smartBinStats?.revenue || 0,
      totalTransactions: smartBinStats?.totalTransactions || 0,
    },
    pspCompanies: {
      revenue: pspStats?.revenue || 0,
      totalTransactions: pspStats?.totalTransactions || 0,
    },

    totalRevenue: {
      year: currentYear,
      amount: currentYearRevenue,
      percentageChange: Number(percentageChange),
      comparisonText: `vs Last Year`,
      monthlyBreakdown: chartData,
    },
    pspRevenue: pspRevenue,
  
  };
}

// PSP Revenue Management
  async getPspRevenueAnalysis(
    page: number = 1,
    limit: number = 10,
    lgaFilter?: string,
    search?: string,
  ) {
    // This returns all PSPs
    const psps = await this.pspService.getPsps(); 
    const total = psps.length;
    
    //  manually filter
    const filteredPsps = psps.filter(psp => {
      if (lgaFilter && psp.lga_id.toString() !== lgaFilter) return false;
      if (search && !psp.company_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPsps = filteredPsps.slice(startIndex, endIndex);

    // Get revenue data for each PSP
    const revenueData = await Promise.all(
      paginatedPsps.map(async (psp, index) => {
        // Get household coverage
        const householdCovered = await this.residentModel.countDocuments({
          lga_id: psp.lga_id,
          deleted_at: null,
        });

        // successful transactions
        const transactions = await this.transactionModel.aggregate([
          {
            $match: {
              psp_id: psp._id,
              status: TransactionStatus.Successful,
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amount' },
              totalBills: { $sum: 1 },
            },
          },
        ]);

        const revenueInfo = transactions[0] || {
          totalRevenue: 0,
          totalBills: 0,
        };

        // Get LGA name
        const lga = await this.lgaModel.findById(psp.lga_id).lean();

        return {
          pspCompany: psp.company_name,
          lga: lga?.name || 'N/A',
          householdCovered,
          revenue: revenueInfo.totalRevenue,
          bills: revenueInfo.totalBills.countDocuments(),
        };
      }),
    );

    return {
      data: revenueData,
      total: filteredPsps.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPsps.length / limit),
    };
  }




async getPspRevenueForAdmin(admin: AdminUser, filters?: GetPickupsForPspDto) {
  const data = await this.pickupService.getPspRevenueForAdmin(filters);
  return new SuccessResponse('PSP revenue retrieved successfully', data);
}

async getRevenueForPsp(psp: PspUser, filters?: any) {
  const data = await this.pickupService.getRevenueForPsp(psp.id, filters);
  return new SuccessResponse('Revenue retrieved successfully', data);
}

async getMonthlyRevenueForAdmin(admin: AdminUser, year?: number) {
  const data = await this.pickupService.getMonthlyRevenueForAdmin(year);
  return new SuccessResponse('Monthly revenue retrieved successfully', data);
}
}