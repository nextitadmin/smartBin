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

@Injectable()
export class DashboardService {
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
  ) { }

  async getResidentDashboard(userId: string, year: number) {
    const [
      resident,
      bills,
      wallet,
      smartbin,
      disposals,
    ] = await Promise.all([
      this.residentModel.findById(userId).lean(),
      this.billModel.find({ userId, userType: 'Resident' }).lean(),
      this.walletModel.findOne({ userId }).lean(),
      this.smartbinModel
        .find({ userId, userType: 'Resident' })
        .sort({ createdAt: -1 })
        .lean(),
      this.pickupModel.find({ accountId: userId, accountType: 'Resident', status: Status.Completed }).lean(),

    ]);
    const filteredDisposals = disposals.filter(
      (d) => new Date(d.pickupDate).getFullYear() === year,
    );
    const binDisposalAnalytics = this.groupDisposalsByMonth(filteredDisposals);

    const outstandingBills = bills.filter((b) => b.status !== 'completed');
    const totalOutstanding = outstandingBills.reduce(
      (sum, b) => sum + b.amount,
      0,
    );
    const annualEstimate = this.estimateAnnualSubscription(bills);

    return {
      id: resident?._id,
      fullName: `${resident?.firstName || ''}`,
      walletBalance: wallet?.ledger_balance || 0,
      totalOutstandingBill: totalOutstanding,
      smartbinApplicationsCount: smartbin.length,
      latestSmartbinStatus: smartbin[0]?.status || 'none',
      estimatedAnnualSubscription: annualEstimate,
      binDisposalAnalytics: {
        year,
        totalDisposals: filteredDisposals.length,
        monthlyBreakdown: binDisposalAnalytics,
      },
    };
  }

  private estimateAnnualSubscription(bills: any[]) {
    const paidBills = bills.filter((b) => b.status === 'completed');
    if (!paidBills.length) return 0;

    const totalAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const averageMonthly = totalAmount / paidBills.length;

    return Math.round(averageMonthly * 12);
  }

  // helper for monthly disposals
  private groupDisposalsByMonth(disposals: any[]) {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      count: 0,
      totalWeight: 0,
    }));

    for (const disposal of disposals) {
      const date = new Date(disposal.createdAt);
      const monthIndex = date.getMonth();

      months[monthIndex].count += 1;
      months[monthIndex].totalWeight += disposal.weight || 0;
    }

    return months;
  }


  // get facility manager dashboard
  async getFacilityManagerDashboard(facilityManagerId: string, year: number) {
    const [facilityManager, residents, wallet, bills, smartbin, disposals] =
      await Promise.all([
        this.facilityModel.findById(facilityManagerId),
        this.residentModel.find({
          registeredBy: facilityManagerId,
          registeredByModel: 'FacilityManager',
        }),
        this.walletModel.findOne({ userId: facilityManagerId }),
        this.billModel.find({
          userId: facilityManagerId,
          userType: 'Facility',
        }),
        this.smartbinModel
          .find({ userId: facilityManagerId, userType: 'Facility' })
          .sort({ createdAt: -1 }),
        this.pickupModel.find({ accountId: facilityManagerId, accountType: 'Facility', status: Status.Completed }).lean(),
      ]);

    const filteredDisposals = disposals.filter(
      (d) => new Date(d.pickupDate).getFullYear() === year,
    );
    const binDisposalAnalytics = this.groupDisposalsByMonth(filteredDisposals);

    const outstandingBills = bills.filter((b) => b.status !== 'completed');
    const totalOutstanding = outstandingBills.reduce(
      (sum, b) => sum + b.amount,
      0,
    );
    const annualEstimate = this.estimateAnnualSubscription(bills);

    return {
      id: facilityManager?._id,
      fullName: `${facilityManager?.firstName || ''}`,
      walletBalance: wallet?.ledger_balance || 0,
      totalOutstandingBill: totalOutstanding,
      smartbinApplicationsCount: smartbin.length,
      latestSmartbinStatus: smartbin[0]?.status || 'none',
      estimatedAnnualSubscription: annualEstimate,
      totalResidentsRegistered: residents.length,
      binDisposalAnalytics: {
        year,
        totalDisposals: filteredDisposals.length,
        monthlyBreakdown: binDisposalAnalytics,
      },
    };
  }

  // get agent dashboard
  async getAgentDashboard(agentId: string, year: number) {
    const [agent, residents, corporates, wallet, bills, smartbin, disposals] =
      await Promise.all([
        this.agentModel.findById(agentId),
        this.residentModel.find({
          registeredBy: agentId,
          registeredByModel: 'Agent',
        }),
        this.corporateModel.find({
          registeredBy: agentId,
          registeredByModel: 'Agent',
        }),
        this.walletModel.findOne({ userId: agentId }),
        this.billModel.find({ userId: agentId, userType: 'Agent' }),
        this.smartbinModel
          .find({ userId: agentId, userType: 'agent' })
          .sort({ createdAt: -1 }),
        this.pickupModel.find({ accountId: agentId, accountType: 'Agent', status: Status.Completed }).lean(),
      ]);

    const filteredDisposals = disposals.filter(
      (d) => new Date(d.pickupDate).getFullYear() === year,
    );
    const binDisposalAnalytics = this.groupDisposalsByMonth(filteredDisposals);

    const outstandingBills = bills.filter((b) => b.status !== 'completed');
    const totalOutstanding = outstandingBills.reduce(
      (sum, b) => sum + b.amount,
      0,
    );
    const annualEstimate = this.estimateAnnualSubscription(bills);

    return {
      id: agent?._id,
      fullName: `${agent?.firstName || ''}`,
      walletBalance: wallet?.ledger_balance || 0,
      totalOutstandingBill: totalOutstanding,
      smartbinApplicationsCount: smartbin.length,
      latestSmartbinStatus: smartbin[0]?.status || 'none',
      estimatedAnnualSubscription: annualEstimate,
      totalResidentsRegistered: residents.length,
      totalCorporatesRegistered: corporates.length,
      binDisposalAnalytics: {
        year,
        totalDisposals: filteredDisposals.length,
        monthlyBreakdown: binDisposalAnalytics,
      },

    };
  }



  // get Corporate Dashboard
  async getCorporateDashboard(userId: string, year: number) {
    const [
      corporate,
      bills,
      wallet,
      smartbin,
      disposals,
    ] = await Promise.all([
      this.corporateModel.findById(userId).lean(),
      this.billModel.find({ userId, userType: 'Corporate' }).lean(),
      this.walletModel.findOne({ userId }).lean(),
      this.smartbinModel
        .find({ userId, userType: 'Corporate' })
        .sort({ createdAt: -1 })
        .lean(),
      this.pickupModel.find({ accountId: userId, accountType: 'Corporate', status: Status.Completed }).lean(),
    ]);

    const filteredDisposals = disposals.filter(
      (d) => new Date(d.pickupDate).getFullYear() === year,
    );
    const binDisposalAnalytics = this.groupDisposalsByMonth(filteredDisposals);

    const outstandingBills = bills.filter((b) => b.status !== 'completed');
    const totalOutstanding = outstandingBills.reduce(
      (sum, b) => sum + b.amount,
      0,
    );
    const annualEstimate = this.estimateAnnualSubscription(bills);

    return {
      id: corporate?._id,
      fullName: `${corporate?.firstName || ''}`,
      walletBalance: wallet?.ledger_balance || 0,
      totalOutstandingBill: totalOutstanding,
      smartbinApplicationsCount: smartbin.length,
      latestSmartbinStatus: smartbin[0]?.status || 'none',
      estimatedAnnualSubscription: annualEstimate,
      binDisposalAnalytics: {
        year,
        totalDisposals: filteredDisposals.length,
        monthlyBreakdown: binDisposalAnalytics,
      },
    };
  }
}
