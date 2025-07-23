import { Injectable,
        NotFoundException,
        BadRequestException
 } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BinType, CustomerType, SmartBin } from '@models/smart-bin.model';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Bill } from '@models/bill.model';
import { Wallet } from '@models/wallet.model';
import { Transaction } from '@models/transaction.model';
import { BinAppDto } from './dto/binAppDto';

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
    // For Resident
    async getResidentBinApplication(userId: string) {
        const [resident,bills,wallet,smartbin] = await Promise.all([
            this.residentModel.findById(userId).lean(),
            this.billModel.find({ userId, userType: 'Resident' }).lean(),
            this.walletModel.findOne({ userId, userType: 'Resident' }).lean(),
            this.smartbinModel
            .findOne({ userId, userType: 'Resident' }).sort({ createdAt: -1 }).lean(),
        ]);
        if (!resident) {
            throw new NotFoundException('Resident not found');
        }
        if (!smartbin) {
            throw new NotFoundException('No bin application found for this resident');
        }
        return {
            orderId: smartbin._id,
            Surname: resident?.firstName,
            firstName: resident?.lastName,
            userId: smartbin.userId,
            userType: 'Resident',
            date: smartbin[0].createdAt,
            status: smartbin.status || 'none',
            amount: smartbin.amount,
            binType: smartbin.binType,
            deliveredOn: smartbin[0].deliveredOn,
            deliveredBy: smartbin[0].deliveredBy,
            address: smartbin?.address,
            approvalDate: smartbin[0].approvalDate,
            resident,
            bills,
            wallet,
            smartbin,
        };        
    }
    // For FAcilityManager
    async getFacilityManagerBinApplication(facilityManagerId: string) {
        const [facilityManager,bills,wallet,smartbin] = await Promise.all([
            this.facilityModel.findById(facilityManagerId).lean(),
            this.billModel.find({ 
                userId: facilityManagerId, userType: 'Facility' }).lean(),
            this.walletModel.findOne({ 
                userId: facilityManagerId, userType: 'Facility' }).lean(),
            this.smartbinModel
            .findOne({ userId: facilityManagerId, userType: 'Facility' }).sort({ createdAt: -1 }).lean(),
       ]);
        if (!facilityManager) {
            throw new NotFoundException('Facility Manager not found');
        }
        if (!smartbin) {
            throw new NotFoundException('No bin application found for this facility manager');
        }
        return {
            id: smartbin._id,
            userId: smartbin.userId,
            userType: 'Facility',
            fullName: `${facilityManager?.firstName || ' ', facilityManager?.lastName || ' '}`,
            buildingName: smartbin.buildingName,
            buildingType: smartbin.buildingType,
            addressOfFacility: smartbin.address,
            closestLandmark: smartbin.closestLandmark,
            facilityManager,
            bills,
            wallet,
            smartbin,
        };
    }
    // For Agent
    async getAgentBinApplication(agentId: string) {
        const [agent,bills,wallet,smartbin ] = await Promise.all([
            this.agentModel.findById(agentId).lean(),
            this.billModel.find({ userId: agentId, userType: 'Agent' }).lean(),
            this.walletModel.findOne({ userId: agentId, userType: 'Agent' }).lean(),
            this.smartbinModel
            .findOne({ userId: agentId, userType: 'Agent' }).sort({ createdAt: -1 }).lean(),
        ]);
        if (!agent) {
            throw new NotFoundException('Agent not found');
        }
        if (!smartbin) {
            throw new NotFoundException('No bin application found for this agent');
        }
        return {
            id: smartbin._id,
            userId: smartbin.userId,
            userType: 'Agent',
            Surname: agent?.firstName,
            firstName: agent?.lastName,
            Email: smartbin.email,
            Phone: smartbin.phoneNumber,
            CustomerType: smartbin.customerType,
            businessName: smartbin.businessName,
            businessType: smartbin.businessType,
            localGovernmentArea: smartbin.localGovernmentArea,
            colsestLandmark: smartbin.closestLandmark,
            companyAddress: smartbin.address,
            status: smartbin.status || 'none',
            date: smartbin[0]?.createdAt,
            amount: smartbin.amount,
            binType: smartbin.binType,
            agent,
        };
    }    
    // For Corporate
    async getCorporateBinApplication(corporateId: string) {
        const [corporate,bills,wallet,smartbin] = await Promise.all([
            this.corporateModel.findById(corporateId).lean(),
            this.billModel.find({ userId: corporateId, userType: 'Corporate' }).lean(),
            this.walletModel.findOne({ userId: corporateId, userType: 'Corporate' }).lean(),
            this.smartbinModel
            .findOne({ userId: corporateId, userType: 'Corporate' }).sort({ createdAt: -1 }).lean(),
        ]);
        if (!corporate) {
            throw new NotFoundException('Corporate not found');
        }
        if (!smartbin) {
            throw new NotFoundException('No bin application found for this corporate');
        }
        return {
            id: smartbin._id,
            userId: smartbin.userId,
            userType: 'Corporate',
            Surname: corporate?.firstName,
            firstName: corporate?.lastName,
            Email: smartbin.email,
            Phone: smartbin.phoneNumber,
            CustomerType: smartbin.customerType,
            businessName: smartbin.businessName,
            businessType: smartbin.businessType,
            localGovernmentArea: smartbin.localGovernmentArea,
            colsestLandmark: smartbin.closestLandmark,
            companyAddress: smartbin.address,
            status: smartbin.status || 'none',
            date: smartbin[0]?.createdAt,
            amount: smartbin.amount,
            binType: smartbin.binType,
            corporate,
        };
    }
    // Estimate annual subscription based on the bills
    private estimateAnnualSubscription(bills: Bill[]): number { 
        const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
        return total * 12; // Assuming the bills are monthly
    }  
    // Get all bin applications
    async getAllBinApplications() {
        const smartbins = await this.smartbinModel.find().sort({ createdAt: -1 }).lean();
        if (!smartbins || smartbins.length === 0) {
            throw new NotFoundException('No bin applications found');
        }
        return smartbins;
    }   
    // Get bin application by ID
    async getBinApplicationById(id: string) {
        const smartbin = await this.smartbinModel.findById(id).lean();
        if (!smartbin) {
            throw new NotFoundException('Bin application not found');
        }
        return smartbin;
    }   
    // Update bin application status
    async updateBinApplicationStatus(id: string, status: string) {
        const smartbin = await this.smartbinModel.findByIdAndUpdate(id, { status }, { new: true }). lean();
        if (!smartbin) {
            throw new NotFoundException('Bin application not found');
        }
        return smartbin;
    }

    // Delete bin application
    async deleteBinApplication(id: string) {
        const smartbin = await this.smartbinModel.findByIdAndDelete(id).lean();
        if (!smartbin) {
            throw new NotFoundException('Bin application not found');
        }
        return { message: 'Bin application deleted successfully' };
    }
    // Create a new bin application
    async createBinApplication(dto: BinAppDto) {
        const { userId, binType, customerType, payerId, address, amount, status,
            paymentMethod, buildingName, businessType, email, phoneNumber, branch, 
            closestLandmark, name, businessName, buildingType, houseName, flatNumber, 
            localGovernmentArea
          } = dto;

        // Check if the user already has a bin application
        const existingApplication = await this.smartbinModel.findOne({ userId }).lean();
        if (existingApplication) {
            throw new BadRequestException('User already has a bin application');
        }
        // Create a new bin application
        const newBinApplication = new this.smartbinModel({
            userId: new Types.ObjectId(userId),
            binType: binType || BinType.Smart,
            customerType: customerType || CustomerType.Resident,
            payerId: payerId,
            address: address || '',
            amount: amount || 0,
            status: status || 'Pending',
            paymentMethod: paymentMethod,
            buildingName: buildingName,
            businessType: businessType,
            email: email,
            phoneNumber: phoneNumber,
            branch: branch,
            closestLandmark: closestLandmark,
            name: name,
            businessName: businessName,
            buildingType: buildingType,
            houseName: houseName,
            flatNumber: flatNumber,
            localGovernmentArea: localGovernmentArea,
            approvalDate: new Date(), // Set approval date to now
        });
        // If the bin type is not specified, default to SmartBin
        if (!binType) {
            newBinApplication.binType = BinType.Smart;
        }    
        // Save the new bin application
        await newBinApplication.save();
        return newBinApplication;
    }
    // Get bin applications by user ID
    async getBinApplicationsByUserId(userId: string) {
        const smartbins = await this.smartbinModel.find({ userId }).sort({ createdAt: -1 }).lean();
        if (!smartbins || smartbins.length === 0) {
            throw new NotFoundException('No bin applications found for this user');
        }
            return smartbins;
        }
    }