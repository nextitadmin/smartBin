import { InjectModel } from '@nestjs/mongoose';
import {
  CreatePspMembersDTO,
  UpdatePspMembersStatusBodyDTO,
} from '../../dto/psp.dto';
import { PSP, PspDocument } from '@models/psp.model';
import { Model } from 'mongoose';
import { PSPUsers, PspUsersDocument } from '@models/psp-users.model';
import { generateRandomChars } from '@common/utils';
import { CacheKeys } from '@src/shared/constants';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { ConfigAttributes } from '@src/config';
import { ConfigService } from '@nestjs/config';

export class PspTeamManagement {
  protected clientUrl: ConfigAttributes['frontendUrl'];
  constructor(
    @InjectModel(PSP.name) private readonly psp: Model<PspDocument>,
    @InjectModel(PSPUsers.name)
    private readonly pspMembers: Model<PspUsersDocument>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly ee: EventEmitter2,
    private readonly configService: ConfigService<ConfigAttributes>,
  ) {
    this.clientUrl = this.configService.get<string>('frontendUrl');
  }

  async createPspMembers(pspMembers: CreatePspMembersDTO & { psp_id: string }) {
    const password = generateRandomChars(8, 'alphanum');

    const psp = await this.psp
      .findById(pspMembers.psp_id)
      .select('company_name');

    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();

    const pspMember = await this.pspMembers.create({
      ...pspMembers,
      psp_details: psp,
      psp_id: pspMembers.psp_id,
      password: password,
    });

    await this.cacheService.set(
      CacheKeys.PspResetPasswordCode(String(resetCode)),
      String(pspMember._id),
    );

    const resetLink = `${this.clientUrl}/psp-team/resetPassword/${resetCode}`;

    this.ee.emit(
      MailNotificationEvents.Account.ResetPassword,
      new SendEmailEvent({
        to: pspMember.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Reset Your Password',
        context: {
          firstName: pspMember.name,
          resetLink: resetLink,
        },
      }),
    );
  }

  async getPspMembers(pspId: string) {
    return this.pspMembers.find({ psp_id: pspId, deleted_at: null });
  }

  async updatePsp(pspId: string, psp: PspDocument) {
    return this.psp.findByIdAndUpdate(pspId, psp);
  }

  async updatePspMembersStatus({
    pspId,
    memberId,
    status,
  }: UpdatePspMembersStatusBodyDTO & { pspId: string; memberId: string }) {
    return this.pspMembers.findByIdAndUpdate(
      {
        _id: memberId,
        psp_id: pspId,
      },
      {
        $set: {
          status,
        },
      },
    );
  }

  async deletePspMembers(pspMembersId: string) {
    return this.pspMembers.findByIdAndUpdate(pspMembersId, {
      deleted_at: new Date(),
    });
  }

  async changePspTeamStatus(pspMemberId: string, status: string) {
    await this.pspMembers.updateOne(
      { _id: pspMemberId },
      {
        $set: {
          status: status,
        },
      },
    );

    return null;
  }
}
