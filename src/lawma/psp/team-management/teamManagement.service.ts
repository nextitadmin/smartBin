import { InjectModel } from "@nestjs/mongoose";
import { CreatePspMembersDTO, UpdatePspMembersStatusBodyDTO } from "../dto/psp.dto";
import { PSP, PspDocument } from "@models/psp.model";
import { Model } from "mongoose";
import { PSPMembers, PspMembersDocument } from "@models/psp-members.model";

export class PspTeamManagement {
    constructor(
        @InjectModel(PSP.name) private readonly psp: Model<PspDocument>,
        @InjectModel(PSPMembers.name) private readonly pspMembers: Model<PspMembersDocument>,
    ) {}


    async createPspMembers(pspMembers: CreatePspMembersDTO & { psp_id: string }) {
        const psp = await this.psp.findById(pspMembers.psp_id).select('company_name');
        return this.pspMembers.create({
            ...pspMembers,
            psp_details: psp,
            psp_id: pspMembers.psp_id,
        });
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
        // return this.pspMembers.findByIdAndDelete(pspMembersId);
        return this.pspMembers.findByIdAndUpdate(pspMembersId, {
            deleted_at: new Date(),
        });
    }
}