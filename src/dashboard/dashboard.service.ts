// dashboard.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident } from '../models/users/resident.model';
import { Agent } from '../models/users/agent.model';
import { Corporate } from '../models/users/corporate.model';
import { FacilityManager } from '../models/users/facility-manager';
import { Bill } from '../models/bill.model';
import { Wallet } from '../models/wallet.model';
import { SmartBin } from '../models/smartbin.model';
import { Transaction } from '../models/transaction.model';


@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Corporate.name) private readonly corporateModel: Model<Corporate>,
    @InjectModel(FacilityManager.name) private readonly facilityModel: Model<FacilityManager>,
    @InjectModel(Bill.name) private readonly billModel: Model<Bill>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(SmartBin.name) private readonly smartbinModel: Model<SmartBin>,
    // @InjectModel(Pickup.name) private readonly pickupModel: Model<Pickup>,
    // @InjectModel(Disposal.name) private readonly disposalModel: Model<Disposal>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
 
  ) {}

  async getDashboard(userId: string, userType: string) {
    switch (userType) {
      case 'Resident':
        return this.getResidentDashboard(userId);
      case 'Facility':
        return this.getFacilityManagerDashboard(userId);
      case 'Agent':
        return this.getAgentDashboard(userId);
      case 'Corporate':
        return this.getCorporateDashboard(userId);
      default:
        throw new BadRequestException('Invalid user type');
    }
  }

 async getResidentDashboard(userId: string) {
  const [
    resident, // if you actually need the resident document
    bills,
    wallet,
    smartbin,
    // pickups,
    // disposals,
  ] = await Promise.all([
    this.residentModel.findById(userId).lean(), // 1
    this.billModel.find({ userId, userType: 'Resident' }).lean(), // 2
    this.walletModel.findOne({ userId }).lean(), // 3
    this.smartbinModel.find({ userId, userType: 'Resident' }).sort({ createdAt: -1 }).lean(), // 4
    // this.pickupModel.find({ userId, userType: 'resident' }).sort({ scheduledDate: 1 }).lean(), // 5
    // this.disposalModel.find({ userId, userType: 'resident' }).lean(), // 6
  ]);

  const outstandingBills = bills.filter(b => b.status !== 'completed');
  const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.amount, 0);
  const annualEstimate = this.estimateAnnualSubscription(bills);

  return {
    walletBalance: wallet?.ledger_balance || 0,
    totalOutstandingBill: totalOutstanding,
    smartbinApplicationsCount: smartbin.length,
    latestSmartbinStatus: smartbin[0]?.status || 'none',
    estimatedAnnualSubscription: annualEstimate,
    // binDisposalAnalytics: {
    //   totalDisposals: disposals.length,
    //   disposalBreakdown: this.groupDisposalsByMonth(disposals),
    // },
  };
}


private estimateAnnualSubscription(bills: any[]) {
  const paidBills = bills.filter(b => b.status === 'completed');
  if (!paidBills.length) return 0;

  const totalAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const averageMonthly = totalAmount / paidBills.length;

  return Math.round(averageMonthly * 12);
}

// private groupDisposalsByMonth(disposals: any[]) {
//   return disposals.reduce((acc, d) => {
//     const month = new Date(d.createdAt).toLocaleString('default', { month: 'long' });
//     acc[month] = (acc[month] || 0) + 1;
//     return acc;
//   }, {});
// }



  async getFacilityManagerDashboard(facilityManagerId: string) {
  const [facilityManager, residents, wallet, bills, smartbin] = await Promise.all([
    this.facilityModel.findById(facilityManagerId),
    this.residentModel.find({ registeredBy: facilityManagerId, registeredByModel: 'FacilityManager' }),
    this.walletModel.findOne({ userId: facilityManagerId}),
    this.billModel.find({ userId: facilityManagerId, userType: 'Facility' }),
    this.smartbinModel.find({ userId:facilityManagerId, userType: 'Facility' }).sort({ createdAt: -1 }),
  ]);

  const outstandingBills = bills.filter(b => b.status !== 'completed');
  const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.amount, 0);
  const annualEstimate = this.estimateAnnualSubscription(bills);

  return {
    id: facilityManager?._id,
    fullName: `${facilityManager?.firstName || ''} ${facilityManager?.lastName || ''}`,
    walletBalance: wallet?.ledger_balance || 0,
    totalOutstandingBill: totalOutstanding,
    smartbinApplicationsCount: smartbin.length,
    latestSmartbinStatus: smartbin[0]?.status || 'none',
    estimatedAnnualSubscription: annualEstimate,
    totalResidentsRegistered: residents.length,
  };
}


 async getAgentDashboard(agentId: string) {
  const [agent, residents, corporates, wallet, bills, smartbin] = await Promise.all([
    this.agentModel.findById(agentId),
    this.residentModel.find({ registeredBy: agentId, registeredByModel: 'Agent' }),
    this.corporateModel.find({ registeredBy: agentId, registeredByModel: 'Agent' }),
    this.walletModel.findOne({ userId: agentId }),
    this.billModel.find({ userId: agentId, userType: 'Agent' }),
    this.smartbinModel.find({ userId: agentId, userType: 'agent' }).sort({ createdAt: -1 }),
  ]);

  const outstandingBills = bills.filter(b => b.status !== 'completed');
  const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.amount, 0);
  const annualEstimate = this.estimateAnnualSubscription(bills);

  return {
    id: agent?._id,
    fullName: `${agent?.firstName || ''} ${agent?.lastName || ''}`,
    walletBalance: wallet?.ledger_balance || 0,
    totalOutstandingBill: totalOutstanding,
    smartbinApplicationsCount: smartbin.length,
    latestSmartbinStatus: smartbin[0]?.status || 'none',
    estimatedAnnualSubscription: annualEstimate,
    totalResidentsRegistered: residents.length,
    totalCorporatesRegistered: corporates.length,
  };
}




 async getCorporateDashboard(userId: string) {
  const [
    corporate,
    bills,
    wallet,
    smartbin,
    // pickups,
    // disposals,
  ] = await Promise.all([
    this.corporateModel.findById(userId).lean(),
    this.billModel.find({ userId, userType: 'Corporate' }).lean(),
    this.walletModel.findOne({ userId }).lean(),
    this.smartbinModel.find({ userId, userType: 'Corporate' }).sort({ createdAt: -1 }).lean(),
    // this.pickupModel.find({ userId, userType: 'corporate' }).sort({ scheduledDate: 1 }).lean(),
    // this.disposalModel.find({ userId, userType: 'corporate' }).lean(),
  ]);

  const outstandingBills = bills.filter(b => b.status !== 'completed');
  const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.amount, 0);
  const annualEstimate = this.estimateAnnualSubscription(bills);

  return {
    walletBalance: wallet?.ledger_balance || 0,
    totalOutstandingBill: totalOutstanding,
    smartbinApplicationsCount: smartbin.length,
    latestSmartbinStatus: smartbin[0]?.status || 'none',
    estimatedAnnualSubscription: annualEstimate,
    // binDisposalAnalytics: {
    //   totalDisposals: disposals.length,
    //   disposalBreakdown: this.groupDisposalsByMonth(disposals),
    // },
  };
}

}
