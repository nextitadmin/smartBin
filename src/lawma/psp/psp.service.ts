import { PSPMembers, PspMembersDocument } from '@models/psp-members.model';
import { PSP, PspDocument } from '@models/psp.model';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreatePspDTO, CreatePspMembersDTO } from './dto/psp.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UpdatePspMembersStatusBodyDTO } from './dto/psp.dto';
import { Lga } from '@models/lgas.model';
import { Administrator } from '@models/administrator.model';

@Injectable()
export class PspService {
  constructor(
    @InjectModel(PSP.name)
    private readonly psp: Model<PspDocument>,
    @InjectModel(PSPMembers.name)
    private readonly pspMembers: Model<PspMembersDocument>,
    @InjectModel(Lga.name) private lga: Model<Lga>,
    @InjectModel(Administrator.name) private admin: Model<Administrator>
  ) {}

  async createPsp(psp: CreatePspDTO, adminId:string) {
    const newAdmin = await this.admin.create({
      name: psp.administrator_name,
      email: psp.administrator_email,
      phoneNumber: psp.administrator_phone,
      role: 'smartbin_partner',
      password: 'password'
    });

    return this.psp.create(psp);
  }

  async getPspLgas(){
    return this.lga.find();
  }

  async createPspMembers(pspMembers: CreatePspMembersDTO & { psp_id: string }) {
    const psp = await this.psp
      .findById(pspMembers.psp_id)
      .select('company_name');
    return this.pspMembers.create({
      ...pspMembers,
      psp_details: psp,
      psp_id: pspMembers.psp_id,
    });
  }

  async getPsps() {
    return this.psp.find();
  }

  async getPsp(pspId: string) {
    return this.psp.findById(pspId);
  }

  async getPspMembers(pspId: string) {
    return this.pspMembers.find({ psp_id: pspId });
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

  async deletePsp(pspId: string) {
    return this.psp.findByIdAndDelete(pspId);
  }

  async deletePspMembers(pspMembersId: string) {
    return this.pspMembers.findByIdAndDelete(pspMembersId);
  }
}
