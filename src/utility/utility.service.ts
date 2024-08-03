import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FlutterwaveService } from '@src/flutterwave/flutterwave.service';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import { generateRandomChars, parseAmountToNumber } from '@common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '@models/customer.model';
import { Model } from 'mongoose';
import { Wallet } from '@models/wallet.model';
import { TransactionService } from '@src/transaction/transaction.service';
import { TransactionStatus, TransactionType } from '@models/transaction.model';
import { WalletService } from '@src/wallet/wallet.service';
import { ProvidersService } from '@src/providers/providers.service';
import { format } from 'date-fns';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { events } from '@common/constants';
import {
  BeneficiaryAddedEvent,
  VerificationVerifiedEvent,
} from '@src/verification/dto';
import { Verification } from '@models/verification.model';
import { Beneficiary, BeneficiaryProductType } from '@models/beneficiary.model';
import { formatUtilityResponse } from './utils';
import { BillPurchasedEvent } from './dto/bill-purchase';
import { SendEmailEvent } from '@src/notification/dto/event';
import { utilityPurchaseSuccessfulEmail } from '@src/emails/utility/purchase-successful';

@Injectable()
export class UtilityService {
  constructor(
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<Verification>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Beneficiary.name)
    private readonly beneficiaryModel: Model<Beneficiary>,
    private readonly providersService: ProvidersService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
    private readonly ee: EventEmitter2,
  ) {}

  private logger = new Logger(UtilityService.name);

  async getBills() {
    return await this.flutterwaveService.getBillCategories();
  }

  async validateBill(payload: ValidateBillAttributes) {
    const cachedVerification = await this.verificationModel.findOne({
      identifier: payload.customerIdentifier,
    });
    if (cachedVerification) {
      return {
        ...cachedVerification.data,
      };
    }
    const response = await this.providersService.validateUtility({
      serviceId: payload.serviceId,
      customerId: payload.customerIdentifier,
    });

    this.ee.emit(
      events.verification.verified,
      new VerificationVerifiedEvent({
        data: response,
        identifier: payload.customerIdentifier,
        serviceId: payload.serviceId,
      }),
    );
    const { Customer_Name } = response;
    return {
      Customer_Name,
    };
  }

  async purchaseBill(payload: PurchaseBillPayload) {
    const customer = await this.customerModel
      .findById(payload.customer_id)
      .select('email first_name phone');

    const customerWallet = await this.walletModel.findOne({
      customer_id: payload.customer_id,
    });

    const feeAmount = 10000; // 15000 is transaction fee and in kobo
    const transactionAmount = payload.amount + feeAmount;
    if (
      !customerWallet ||
      customerWallet.available_balance < transactionAmount
    ) {
      throw new BadRequestException('Insufficient funds to complete purchase!');
    }

    // Debit customer wallet
    await this.walletService.debitWallet({
      customer_id: payload.customer_id,
      amount: payload.amount,
      field: 'both_balance',
    });
    await this.walletService.debitWallet({
      customer_id: payload.customer_id,
      amount: feeAmount,
      field: 'both_balance',
    });

    const utilityReference = `${format(
      new Date(),
      'yyyyMMddHHmm',
    )}${generateRandomChars(24)}`.toUpperCase();
    const reference = await this.transactionService.createTransaction({
      customer_id: payload.customer_id,
      amount: payload.amount,
      type: TransactionType.BillPayment,
      narration: 'Bill Payment',
      reference: utilityReference,
    });
    await this.transactionService.createTransaction({
      customer_id: payload.customer_id,
      amount: feeAmount,
      type: TransactionType.Fee,
      narration: 'Bill Payment Fee',
      reference: utilityReference,
    });

    if (payload.beneficiary) {
      const beneficiaryDetails = await this.beneficiaryModel.findById(
        payload.beneficiary,
      );
      if (!beneficiaryDetails) {
        throw new BadRequestException('Invalid Beneficiary selected!');
      }

      const verification = await this.verificationModel.findById(
        beneficiaryDetails.verificationId,
      );
      payload.customerIdentifier = verification.identifier;
      payload.serviceId = verification.serviceId;
    }
    const billPayload = {
      customer: payload.customerIdentifier,
      amount: payload.amount / 100,
      itemCode: payload.itemCode,
      billerCode: payload.billCode,
      reference,
    };

    const billResponse = await this.providersService.purchaseUtility({
      customerId: billPayload.customer,
      serviceId: payload.serviceId,
      amount: billPayload.amount,
      phone: customer.phone,
      reference,
    });

    if (!billResponse.success) {
      // revert money
      await this.walletService.creditWallet({
        customer_id: payload.customer_id,
        amount: transactionAmount,
        field: 'both_balance',
      });

      await this.transactionService.updateTransaction(
        { reference },
        {
          status: TransactionStatus.Failed,
          meta: billResponse,
        },
      );

      throw new BadRequestException(
        'Unable to complete bill payment, Please try again!',
      );
    }

    const wallet = await this.walletModel.findById(customerWallet._id);
    await this.transactionService.updateTransaction(
      {
        reference,
      },
      {
        status: TransactionStatus.Successful,
        available_balance: wallet.available_balance,
        ledger_balance: wallet.ledger_balance,
        meta: {
          ...billResponse.data.meta,
        },
      },
    );

    this.ee.emit(
      events.bills.purchased,
      new BillPurchasedEvent({
        reference,
      }),
    );

    // Create beneficiary
    this.ee.emit(
      events.beneficiary.added,
      new BeneficiaryAddedEvent({
        identifier: payload.customerIdentifier,
        customerId: payload.customer_id,
        productType: BeneficiaryProductType.Utility,
      }),
    );

    return billResponse.data.reference;
  }

  async generateUtilityToken({
    reference,
    customer_id,
  }: {
    reference: string;
    customer_id: string;
  }) {
    const transaction = await this.transactionService.getTransaction({
      reference,
      customer_id,
    });

    if (!transaction) {
      throw new BadRequestException(
        'Unable to generate bill token! Please contact support!',
      );
    }

    if (
      transaction.meta.content.transactions.status !== 'pending' &&
      transaction.meta.content.transactions.status !== 'reversed'
    ) {
      return formatUtilityResponse(transaction);
    }

    const tokenResponse = await this.providersService.requeryUtilityPurchase({
      reference,
    });

    if (!tokenResponse.success) {
      throw new BadRequestException('Unable to generate bill token!');
    }

    return formatUtilityResponse(tokenResponse.data);
  }

  @OnEvent(events.bills.purchased)
  async onBillPurchased(event: BillPurchasedEvent) {
    const { reference } = event.data;
    const transaction = await this.transactionService.getTransaction({
      reference,
    });

    if (!transaction) {
      throw new BadRequestException(
        'Unable to generate bill token! Please contact support!',
      );
    }

    if (
      transaction.meta.content.transactions.status == 'pending' ||
      transaction.meta.content.transactions.status == 'reversed'
    ) {
      return this.logger.warn('Payment not successful');
    }

    const customer = await this.customerModel.findById(transaction.customer_id);

    const transactionMeta = formatUtilityResponse(transaction);
    // Send email
    const emailPayload = {
      amount: parseAmountToNumber(transactionMeta.amount),
      transactionId: transaction.reference,
      token: transactionMeta.extra,
      unitValue: transactionMeta.unit,
      firstname: customer.first_name,
    };

    this.ee.emit(
      events.sendEmail,
      new SendEmailEvent({
        to: customer.email,
        subject: 'Token Purchase Successful 🎉',
        html: utilityPurchaseSuccessfulEmail(emailPayload),
      }),
    );
  }
}
