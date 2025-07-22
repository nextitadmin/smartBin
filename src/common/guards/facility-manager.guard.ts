import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
// // import { CustomerService } from '../../customer/customer.service';
import { Request } from 'express';
import { AuthUser, FacilityManagerUser } from '../types';
import { UserRole } from '@models/types';

@Injectable()
export class FacilityManagerAuthGuard implements CanActivate {
  //   // constructor(private readonly customerService: CustomerService) {}

  private logger = new Logger(FacilityManagerAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Partial<AuthUser>;
      facilityManager?: FacilityManagerUser;
    } = ctx.switchToHttp().getRequest();

    const request = ctx.switchToHttp().getRequest();
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    //     // const customer = await this.customerService.getCustomerDetailsbyToken(
    //     // token,
    //     // );
    //     if (!true) {
    //       this.logger.warn('failed to auth: no user object in request');
    //       throw new UnauthorizedException('not authenticated!');
    //     }

    req.facilityManager = {
      id: '',
      email: 'demo-failcity-email@test.com',
      role: UserRole.Facility,
    };

    return true;
  }
}
