import { Role, RoleAttributes, TRole } from '@models/role.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async getRoles(createdBy: string) {
    return this.roleModel.find({
      createdBy,
    });
  }

  async createRole(role: RoleAttributes): Promise<TRole> {
    return this.roleModel.create(role);
  }
}
