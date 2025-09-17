import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AdminMessagePatternCommands } from 'src/shared/constants';

@Injectable()
export class UsersService {
  constructor() {}

  async getAllUsers(page: string, limit: string) {
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.Users.GetUsers },
    //     {
    //       page,
    //       limit,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }

  async getUserDetails(userId: string, role: string) {
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.Users.GetUser },
    //     {
    //       userId: userId,
    //       role: role,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }

  async getFacilityUsers(accountId: string, page: number, limit: number) {
    // console.log();
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.Users.GetFacilityUsers },
    //     {
    //       accountId: accountId,
    //       page,
    //       limit,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }

  async getAgentUsers(agentId: string, page: number, limit: number) {
    // console.log(agentId);
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.Users.GetAgentRegisteredUsers },
    //     {
    //       agentId: agentId,
    //       page,
    //       limit,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }
}
