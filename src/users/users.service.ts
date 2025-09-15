import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resident } from '@models/users/resident.model';
import { Agent } from '@models/users/agent.model';
import { Corporate } from '@models/users/corporate.model';
import { FacilityManager } from '@models/users/facility-manager.model';
import { UserRole } from '@models/types';
import { Subscription } from '@models/subscription.model';
import { FacilityUsers } from '@models/facility-users.model';
import { log } from 'console';


@Injectable()
export class UsersService {
    constructor(

        @InjectModel(Resident.name) private readonly residentModel: Model<Resident>,
        @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
        @InjectModel(Corporate.name)
        private readonly corporateModel: Model<Corporate>,
        @InjectModel(FacilityManager.name)
        private readonly facilityManagerModel: Model<FacilityManager>,
        @InjectModel(FacilityUsers.name) private readonly facilityUsersModel: Model<FacilityUsers>,
        @InjectModel(Subscription.name)
        private readonly subscriptionModel: Model<Subscription>,
    ) { }

    async getAllUsers(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [residents, agents, corporates, facilityManagers, counts] = await Promise.all([
            this.residentModel.find().sort({ createdAt: -1 }).lean(),
            this.agentModel.find().sort({ createdAt: -1 }).lean(),
            this.corporateModel.find().sort({ createdAt: -1 }).lean(),
            this.facilityManagerModel.find().sort({ createdAt: -1 }).lean(),
            Promise.all([
                this.residentModel.countDocuments(),
                this.agentModel.countDocuments(),
                this.corporateModel.countDocuments(),
                this.facilityManagerModel.countDocuments(),
            ])
        ]);
        const mapUser = (user: any, role: UserRole) => ({
            userId: user._id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            userType: role,
            lga: user.localGovernmentArea || null,
            pspCompany: user.pspCompany || null,
            status: user.status,
            createdAt: user.createdAt,

        });
        const allUsers = [
            ...residents.map(user => mapUser(user, UserRole.Resident)),
            ...agents.map(user => mapUser(user, UserRole.Agent)),
            ...corporates.map(user => mapUser(user, UserRole.Corporate)),
            ...facilityManagers.map(user => mapUser(user, UserRole.Facility)),
        ];
        allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const paginateUsers = allUsers.slice(skip, skip + limit);
        const totalUsers = counts.reduce((a, b) => a + b, 0);

        return {
            allUsers: paginateUsers,
            totalUsers: totalUsers,
            paging: {
                total: totalUsers,
                page,
                pages: Math.ceil(counts.reduce((a, b) => a + b, 0) / limit),
                size: limit,
            }
        }
    }

    // user details
    async getUserById(userId: string, role: UserRole) {
        let user;

        if (role === UserRole.Resident) {
            user = await this.residentModel.findById(userId).lean();
        } else if (role === UserRole.Agent) {
            user = await this.agentModel.findById(userId).lean();
        } else if (role === UserRole.Corporate) {
            user = await this.corporateModel.findById(userId).lean();
        } else if (role === UserRole.Facility) {
            user = await this.facilityManagerModel.findById(userId).lean();
        } else {
            throw new BadRequestException('Invalid user role provided.')
        }

        let data = {
            userId: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address || null,
            userType: role,
            createdAt: user.createdAt,
            lga: user.localGovermentArea || null,
            pspCompany: user.pspCompany || null,
            status: user.status,
            subscription: user.subscription || null,
            lastLogin: user.lastLogin || null,
            registeredAccount: user?.registeredAccount || null,


        }
        return data;


    }


    // facility users
    async getFacilityUsers({ accountId }: { accountId?: string } = {}, page = 1, limit = 10) {
        console.log(accountId)
        const skip = (page - 1) * limit;

        

        const [users, total] = await Promise.all([
            this.facilityUsersModel
                .find({
                    accountId: accountId
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.facilityUsersModel.countDocuments({
                accountId: accountId,
            }),
        ]);

        return {
            data: users,
            paging: {
                total,
                page,
                pages: Math.ceil(total / limit),
                size: limit,
            },
        };
    }



    async getAgentRegisteredUsers({ agentId }: { agentId?: string } = {}, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        console.log(agentId);

        const [residents, corporates, totalResidents, totalCorporates] = await Promise.all([
            this.residentModel.find({ agentId }).sort({ createdAt: -1 }).lean(),
            this.corporateModel.find({ agentId }).sort({ createdAt: -1 }).lean(),
            this.residentModel.countDocuments({ agentId }),
            this.corporateModel.countDocuments({ agentId }),
        ]);

        const mapUser = (user: any, type: UserRole) => ({
            userId: user._id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            userType: type,
            createdAt: user.createdAt,
            lga: user.localGovernmentArea || null,
            pspCompany: user.pspCompany || null,
            status: user.status,
        });

        const allRegisteredUsers = [
            ...residents.map(user => mapUser(user, UserRole.Resident)),
            ...corporates.map(user => mapUser(user, UserRole.Corporate)),
        ];
        allRegisteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const paginatedUsers = allRegisteredUsers.slice(0, limit);

        const total = totalResidents + totalCorporates;

        return {
            data: paginatedUsers,
            paging: {
                total,
                page,
                pages: Math.ceil(total / limit),
                size: limit,
            },
        };
    }

}
