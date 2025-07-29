import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Bill, BillStatus, PaymentMethod } from '@models/bill.model';
import { SuccessResponse } from '@common/http';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Model } from 'mongoose';
import { PayBillDto, BillResponseDto, FacilityBillResponseDto, CorporateBillResponseDto } from './dtos/bill.dto';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { Wallet } from '@models/wallet.model';



@Injectable()
export class BillService {

    constructor(
        // @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
        // @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
        // @InjectModel(Corporate.name)
        // private readonly corporateModel: Model<Corporate>,
        // @InjectModel(FacilityManager.name)
        // private readonly facilityModel: Model<FacilityManager>,
        @InjectModel(Bill.name) private readonly billModel: Model<Bill>,
        @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    ) { }


    async getResidentBills(userId: string): Promise<SuccessResponse<BillResponseDto[]>> {
        const bills = await this.billModel
            .find({ userId, userType: 'Resident' })
            .sort({ dueDate: -1 })
            .lean();

        const bill = bills.map(bill => ({
            id: bill._id.toString(),
            billId: bill.billId,
            amount: bill.amount,
            service: bill.service,
            dueDate: bill.dueDate,
            status: bill.status,
            paymentMethod: bill.paymentMethod || null,
            paidAt: bill.paidAt || null,
        }));

        return new SuccessResponse('Bills retrieved successfully', bill);
    }


    async payBill(userId: string, billId: string, dto: PayBillDto, user: any): Promise<SuccessResponse<BillResponseDto>> {
        const bill = await this.billModel.findOne({ userId, billId, userType: 'Resident' });
        if (!bill) throw new NotFoundException('Bill not found');

        if (bill.status === BillStatus.Completed) {
            throw new BadRequestException('Bill has already been paid');
        }

        if (dto.paymentMethod === PaymentMethod.Wallet) {
            const wallet = await this.walletModel.findOne({ userId });
            if (!wallet || wallet.ledger_balance < bill.amount) {
                throw new BadRequestException('Insufficient wallet balance');
            }

            wallet.ledger_balance -= bill.amount;
            await wallet.save();

            bill.status = BillStatus.Completed;
            bill.paidAt = new Date();
            bill.paymentMethod = PaymentMethod.Wallet;
            await bill.save();

            return new SuccessResponse('Bill paid successfully via wallet', new BillResponseDto);
        }

        // if (dto.paymentMethod === PaymentMethod.AlatByWema) {
        //   const result = await initiateAlatTransaction(...);
        //   bill.transactionID = result.transactionID;
        //   bill.transactionReference = result.transactionReference;
        //   bill.paymentMethod = PaymentMethod.AlatByWema;
        //   bill.status = BillStatus.Pending;
        //   await bill.save();

        //   return new SuccessResponse('AlatPay payment initiated', {
        //     paymentUrl: result.authorization.payment_url,
        //     transactionID: result.transactionID,
        //     reference: result.transactionReference,
        //   });
        // }

        throw new BadRequestException('Unsupported payment method');
    }

    //   async verifyPayment(reference: string) {
    //     const transaction = await verifyAlatTransaction(reference);
    //     if (!transaction) throw new NotFoundException('Transaction not found');

    //     const bill = await this.billModel.findOne({
    //       userId: transaction.userId,
    //       userType: transaction.userType,
    //       amount: transaction.amount,
    //       service: transaction.service,
    //       status: transaction.status,
    //     });

    //     if (!bill) throw new NotFoundException('Bill not found for transaction');

    //     if (bill.status !== 'paid') {
    //       bill.status = 'paid';
    //       bill.paidAt = new Date();
    //       bill.paymentMethod = 'Alat By Wema';
    //       await bill.save();
    //     }

    //     return { message: 'Payment verified and bill updated', bill, transaction };
    //   }

    //   async seedBills(userId: string): Promise<any> {
    //     const bills = [
    //       {
    //         userId,
    //         userType: 'Resident',
    //         billId: `OD${Math.floor(Math.random() * 1e8)}`,
    //         service: 'Waste Bin Disposal',
    //         amount: 20000,
    //         dueDate: new Date('2025-07-21'),
    //       },
    //       {
    //         userId,
    //         userType: 'Resident',
    //         billId: `OD${Math.floor(Math.random() * 1e8)}`,
    //         service: 'Smart Bin Purchase',
    //         amount: 150000,
    //         dueDate: new Date('2025-07-25'),
    //       },
    //       {
    //         userId,
    //         userType: 'Resident',
    //         billId: `OD${Math.floor(Math.random() * 1e8)}`,
    //         service: 'Waste Bin Disposal',
    //         amount: 10000,
    //         dueDate: new Date('2025-07-30'),
    //       },
    //     ];

    //     await this.billModel.insertMany(bills);
    //     return { message: 'Sample bills created', count: bills.length, data: bills };
    //   }


    async getFacilityBills(userId: string): Promise<SuccessResponse<FacilityBillResponseDto[]>> {
        const bills = await this.billModel
            .find({ userId, userType: 'FacilityManager' })
            .sort({ dueDate: -1 })
            .lean();

        const Bills = bills.map((bill) => ({
            id: bill._id.toString(),
            billId: bill.billId,
            amount: bill.amount,
            service: bill.service,
            dueDate: bill.dueDate,
            status: bill.status,
            paymentMethod: bill.paymentMethod,
            paidAt: bill.paidAt,
            customerName: bill.customerName,
        }));

        return new SuccessResponse<FacilityBillResponseDto[]>(
            'Facility Manager Bills retrieved successfully',
            Bills
        );
    }


    async payFacilityBill(userId: string, dto: PayBillDto, user: any): Promise<SuccessResponse<FacilityBillResponseDto | any>> {
        const bill = await this.billModel.findOne({
            userId,
            billId: dto.billId,
            userType: 'FacilityManager',
        });

        if (!bill) throw new NotFoundException('Bill not found');
        if (bill.status === BillStatus.Completed) throw new BadRequestException('Bill already paid');

        if (dto.paymentMethod === PaymentMethod.Wallet) {
            const wallet = await this.walletModel.findOne({ userId });

            if (!wallet || wallet.ledger_balance < bill.amount) {
                throw new BadRequestException('Insufficient wallet balance');
            }

            wallet.ledger_balance -= bill.amount;
            await wallet.save();

            bill.status = BillStatus.Completed;
            bill.paidAt = new Date();
            bill.paymentMethod = PaymentMethod.Wallet;
            await bill.save();

            const response: FacilityBillResponseDto = {
                id: bill._id.toString(),
                billId: bill.billId,
                amount: bill.amount,
                service: bill.service,
                dueDate: bill.dueDate,
                status: bill.status,
                paymentMethod: bill.paymentMethod,
                paidAt: bill.paidAt,
                customerName: bill.customerName,
            };

            return new SuccessResponse('Facility Manager bill paid successfully', response);
        }

        // For AlatByWema (if you want to add later)
        throw new BadRequestException('Invalid payment method');
    }




    async getCorporateBills(userId: string): Promise<SuccessResponse<CorporateBillResponseDto[]>> {
        const bills = await this.billModel

            .find({ userId: new Types.ObjectId(userId), userType: 'Corporate' })
            .sort({ dueDate: -1 })
            .lean();

        const Bills = bills.map((bill) => ({
            id: bill._id.toString(),
            billId: bill.billId,
            amount: bill.amount,
            service: bill.service,
            dueDate: bill.dueDate,
            status: bill.status,
            paymentMethod: bill.paymentMethod,
            paidAt: bill.paidAt,
            branch: bill.branch
        }));
        console.log(Bills)
        return new SuccessResponse<CorporateBillResponseDto[]>(
            'Corporate Bills retrieved successfully',
            Bills
        );
    }


    async payCorporateBill(userId: string, dto: PayBillDto, user: any): Promise<SuccessResponse<CorporateBillResponseDto | any>> {
        const bill = await this.billModel.findOne({
            userId,
            billId: dto.billId,
            userType: 'Corporate',
        });

        if (!bill) throw new NotFoundException('Bill not found');
        if (bill.status === BillStatus.Completed) throw new BadRequestException('Bill already paid');

        if (dto.paymentMethod === PaymentMethod.Wallet) {
            const wallet = await this.walletModel.findOne({ userId });

            if (!wallet || wallet.ledger_balance < bill.amount) {
                throw new BadRequestException('Insufficient wallet balance');
            }

            wallet.ledger_balance -= bill.amount;
            await wallet.save();

            bill.status = BillStatus.Completed;
            bill.paidAt = new Date();
            bill.paymentMethod = PaymentMethod.Wallet;
            await bill.save();

            const response: CorporateBillResponseDto = {
                id: bill._id.toString(),
                billId: bill.billId,
                amount: bill.amount,
                service: bill.service,
                dueDate: bill.dueDate,
                status: bill.status,
                paymentMethod: bill.paymentMethod,
                paidAt: bill.paidAt,
                branch: bill.branch,
            };

            return new SuccessResponse('Facility Manager bill paid successfully', response);
        }

        // For AlatByWema (if you want to add later)
        throw new BadRequestException('Invalid payment method');
    }

}
