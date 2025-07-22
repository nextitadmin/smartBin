import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payer, PayerDocument } from '@models/users/payer.model';
import { sendPayerIdEmail } from '@utils/mailer';
import { CreatePayerDto } from './dto/payer.dto';

@Injectable()
export class PayerService {
  constructor(
    @InjectModel(Payer.name) private readonly payerModel: Model<PayerDocument>,
  ) {}

  async createPayer(dto: CreatePayerDto) {
    const { firstName, lastName, email, dateOfBirth, nin, phoneNumber } = dto;

    const existing = await this.payerModel
      .findOne({ email })
      .select('firstName lastName payerId');
    if (existing) {
      return {
        message: 'Payer already exists',
        data: existing,
      };
    }

    try {
      const newAccount = await this.payerModel.create({
        firstName,
        lastName,
        email,
        dateOfBirth,
        nin,
        phoneNumber,
      });

      await sendPayerIdEmail({
        email: newAccount.email,
        firstName: newAccount.firstName,
        payerId: newAccount.payerId,
      });

      return {
        message:
          'Payer created successfully. Payer ID has been sent to your mail',
        data: newAccount,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating payer: ' + error.message,
      );
    }
  }

  async getPayerByPayerId(payerId: string) {
    const payer = await this.payerModel
      .findOne({ payerId })
      .select('firstName lastName email phoneNumber');

    if (!payer) throw new NotFoundException('Payer not found');

    return payer;
  }
}
