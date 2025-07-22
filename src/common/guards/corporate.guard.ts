import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
// // import { CustomerService } from '../../customer/customer.service';
import { Request } from 'express';
import { AuthUser, CorporateUser } from '../types';
import { UserRole } from '@models/types';

@Injectable()
export class CorporateAuthGuard implements CanActivate {
  //   // constructor(private readonly customerService: CustomerService) {}

  private logger = new Logger(CorporateAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: AuthUser;
      corporate?: CorporateUser;
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

    req.user = {
      id: '',
      email: '',
      role: UserRole.Corporate,
    };

    req.corporate = {}; // additional details apart from the above

    return true;
  }
}
