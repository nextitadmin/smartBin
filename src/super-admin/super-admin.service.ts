import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, models, Types } from 'mongoose';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill, BillStatus } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { SmartBin, SmartbinStatus } from '@models/smart-bin.model';
import { ServiceType, Transaction, TransactionStatus } from '@models/transaction.model';
import { Pickup, Status } from '@models/pickup';
import { TeamMember } from '@models/team.model';
import { UserRole } from '@models/types';
import { Paging } from '@common/http';
import { PSP } from '@models/psp.model';
import { AdministratorRole } from '@models/administrator.model';
import { Lga } from '@models/lgas.model';
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
      totalPSPCompanies,
    ] = await Promise.all([
      this.residentModel.countDocuments().exec(),
      this.agentModel.countDocuments().exec(),
      this.corporateModel.countDocuments().exec(),
      this.facilityModel.countDocuments().exec(),
      this.pspModel.countDocuments().exec(),
    ]);
    const totalRegisteredUsers =
      residentCount + agentCount + corporateCount + facilityManagerCount;

    const [
      pendingRequests,
      inventoryRequests,
      scheduledRequests,
      deliveredRequests,
      activatedRequests,
      totalBinRequests,
    ] = await Promise.all([
      this.smartbinModel.countDocuments({ status: SmartbinStatus.Pending }).exec(),
      this.smartbinModel.countDocuments({ status: SmartbinStatus.Inventory }).exec(),
      this.smartbinModel.countDocuments({ status: SmartbinStatus.ScheduledForDelivery }).exec(),
      this.smartbinModel.countDocuments({ status: SmartbinStatus.Delivered }).exec(),
      this.smartbinModel.countDocuments({ status: SmartbinStatus.Activated }).exec(),
      this.smartbinModel.countDocuments().exec(),
    ]);

    const percentageByUserType = {
      resident: Math.floor((residentCount / totalRegisteredUsers) * 100) || 0,
      agent: Math.floor((agentCount / totalRegisteredUsers) * 100) || 0,
      corporate: Math.floor((corporateCount / totalRegisteredUsers) * 100) || 0,
      facilityManager:
        Math.floor((facilityManagerCount / totalRegisteredUsers) * 100) || 0,
    };

    const [
      totalRevenue,
      binPurchaseRevenue,
      wasteDisposalRevenue,
      pspRevenue,
    ] = await Promise.all([
      this.transactionModel.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { service: ServiceType.SmartBinPurchase } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { service: ServiceType.WasteDisposal } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      //Psprevenue calculation
      this.transactionModel.aggregate([
        { $match: { service: ServiceType.WalletCharge } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    // PSP Revenue Calculation
    const pspRevenueResults = await this.pickupModel.aggregate([
      {
        $match: {
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
      { $unwind: '$transactionData' },
      {
        $match: {
          'transactionData.status': TransactionStatus.Successful,
        },
      },
      {
        $group: {
          _id: '$psp_id',
          totalRevenue: { $sum: '$transactionData.amount' },
          totalPickups: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const totalPSPRevenue = pspRevenueResults.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0,
    );

    const [
      binsDelivered,
      wastePickedUp,
      unpaidBillsCount,
      unpaidBillsAmount,
    ] = await Promise.all([
      this.smartbinModel.countDocuments({ status: SmartbinStatus.Delivered }).exec(),
      this.pickupModel.aggregate([
        { $match: { status: Status.Completed } },
        { $group: { _id: null, totalWeight: { $sum: '$weight' } } },
      ]),
      this.billModel.countDocuments({ status: BillStatus.Completed }).exec(),
      this.billModel.aggregate([
        { $match: { status: BillStatus.Pending } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);
    const lgasCovered = await this.lgaModel.countDocuments().exec();
    const householdsEnumerated = await this.residentModel.countDocuments().exec();
    const topPSPcompanies = await this.pspModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      totals: {
        registeredUSers: totalRegisteredUsers,
        pspCompanies: totalPSPCompanies,
        binRequests: totalBinRequests,
        totalRevenue: totalRevenue[0]?.total
      },
      userCategory: {
        residentUsers: residentCount,
        agentsUsers: agentCount,
        corporateUsers: corporateCount,
        facilityManagerUsers: facilityManagerCount,
        percentageByUserType,
      },
      binRequests: {
        pendingRequests,
        inventoryRequests,
        scheduledRequests,
        deliveredRequests,
        activatedRequests,
        totalBinRequests,
      },
      revenueBreakdown: {
        binPurchaseRevenue: binPurchaseRevenue[0]?.total,
        wasteDisposalRevenue: wasteDisposalRevenue[0]?.total,
        pspRevenue: totalPSPRevenue
      },
      operationalMetrics: {
        householdsEnumerated,
        binsDelivered,
        wastePickedUp,
        lgasCovered,
        unpaidBillsCount,
        unpaidBillsAmount: unpaidBillsAmount[0]?.totalAmount,
      },
      topPSPcompanies: topPSPcompanies,
    }
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
