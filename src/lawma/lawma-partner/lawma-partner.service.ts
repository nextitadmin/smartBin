import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Administrator,
  AdministratorRole,
  AdministratorStatus,
} from '@models/administrator.model';
import { Model } from 'mongoose';

@Injectable()
export class LawmaPartnerService {
  private readonly logger = new Logger(LawmaPartnerService.name);
  constructor(
    @InjectModel(Administrator.name)
    private readonly administratorModel: Model<Administrator>,
  ) {}
}
