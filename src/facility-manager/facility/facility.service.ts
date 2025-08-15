import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Paging } from '@common/http';
import { Facility, FacilityDocument } from '@models/facilities';
import { CreateFacilityDto, UpdateFacilityDto } from '../dto/facility.dto';


@Injectable()
export class FacilityService {
    constructor(
        @InjectModel(Facility.name) private facilityModel: Model<FacilityDocument>,
    ) { }

    async addFacility(dto: CreateFacilityDto, userId: string) {
        const data = await this.facilityModel.create({ ...dto, userId: userId });
        return {
            data
        };
    }

    async fetchFacilities(userId: string, paging: Partial<Paging>, search?: string) {
        const query: any = { userId };

        if (search) {
            query.$or = [
                { buildingName: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { localGovernment: { $regex: search, $options: 'i' } },
            ];
        }

        const limit = paging.size || 10;
        const page = paging.page || 1;
        const [data, total] = await Promise.all([
            this.facilityModel.find(query).skip((page - 1) * limit).limit(limit),
            this.facilityModel.countDocuments(query)
        ])
        return {
            data,
            paging: {
                page,
                size: limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };

    }

    async findById(id: string, userId: string) {
        const facility = await this.facilityModel.findOne({ _id: id, userId: userId });
        if (!facility) throw new NotFoundException('Facility not found');
        return facility;
    }

    async update(id: string, dto: UpdateFacilityDto, userId: string) {
        const updated = await this.facilityModel.findOneAndUpdate(
            { _id: id, userId: userId },
            { $set: dto },
            { new: true },
        );
        if (!updated) throw new NotFoundException('Facility not found');
        return updated;
    }

    async delete(id: string, userId: string) {
        const deleted = await this.facilityModel.findOneAndDelete({ _id: id, userId: userId });
        if (!deleted) throw new NotFoundException('Facility not found');
    }
}
