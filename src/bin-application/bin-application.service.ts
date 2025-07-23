import { Injectable,
        NotFoundException,
        BadRequestException
 } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SmartBin } from '@models/smart-bin.model';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { Transaction } from '@models/transaction.model';

@Injectable()
export class BinApplicationService {
    constructor(
        @InjectModel(SmartBin.name) private readonly smartbinModel: Model<SmartBin>,
        @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
        @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
        @InjectModel(Corporate.name) private readonly corporateModel: Model<Corporate>,
        @InjectModel(FacilityManager.name) private readonly facilityModel: Model<FacilityManager>,
        @InjectModel(Bill.name) private readonly billModel: Model<Bill>,
        @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
        @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>
    ) { }

    async getBinApplication(userId: string, userType: string) {
        switch (userType) {
            case 'Resident':
                return this.getResidentBinApplication(userId);
            case 'Facility':
                return this.getFacilityManagerBinApplication(userId);
            case 'Agent':
                return this.getAgentBinApplication(userId);
            case 'Corporate':
                return this.getCorporateBinApplication(userId);
            default:
                throw new BadRequestException('Invalid user type');
        }
    }
    async getResidentBinApplication(userId: string) {
        const [
            resident,
            bills,
            wallet,
            smartbin,
            // pickups,
            // disposals,
        ] = await Promise.all([
            this.residentModel.findById(userId).lean(),
            this.billModel.find({ userId, userType: 'Resident' }).lean(),
            this.walletModel.findOne({ userId, userType: 'Resident' }).lean(),
            this.smartbinModel
            .findOne({ userId, userType: 'Resident' }).sort({ createdAt: -1 }).lean(),
            // this.pickupModel.find({ userId, userType: 'Resident' }).lean(),
            // this.disposalModel.find({ userId, userType: 'Resident' }).lean(),
        ]);
        if (!resident) {
            throw new NotFoundException('Resident not found');
        }
        if (!smartbin) {
            throw new NotFoundException('No bin application found for this resident');
        }
        return {
            orderId: smartbin[0]._id,
            userId: smartbin[0].userId,
            userType: 'Resident',
            date: smartbin[0].createdAt,
            status: smartbin[0].status,
            amount: smartbin[0].amount,
            binType: smartbin[0].binType,
            deliveredOn: smartbin[0]?.deliveredOn,
            deliveredBy: smartbin[0]?.deliveredBy,
            address: smartbin[0]?.address,
            approvalDate: smartbin[0].approvalDate,
            resident,
            bills,
            wallet,
            smartbin,
        };        
    }