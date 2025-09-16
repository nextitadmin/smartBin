import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AdminMessagePatternCommands } from 'src/shared/constants';

@Injectable()
export class KycFlowService {
  constructor() {}

  async getAllApplications(page: string, limit: string) {
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.KycFlow.GetApplications },
    //     {
    //       page,
    //       limit,
    //       status,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }

  async getApplicationDetails(applicationId: string) {
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.KycFlow.GetApplicationDetails },
    //     {
    //       applicationId: applicationId,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }

  async approveApplication(applicationId: string) {
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.KycFlow.ApproveApplication },
    //     {
    //       applicationId: applicationId,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }

  async rejectApplication(applicationId: string) {
    // const response = await this.client
    //   .send(
    //     { cmd: AdminMessagePatternCommands.KycFlow.RejectApplication },
    //     {
    //       applicationId: applicationId,
    //     },
    //   )
    //   .toPromise();
    // return response;
  }
}
