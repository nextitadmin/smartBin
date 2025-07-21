// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Logger,
//   UnauthorizedException,
// } from '@nestjs/common';
// // import { CustomerService } from '../../customer/customer.service';
// import { Request } from 'express';
// import { AuthCustomer } from '../types';

// @Injectable()
// export class ResidentAuthGuard implements CanActivate {
//   // constructor(private readonly customerService: CustomerService) {}

//   private logger = new Logger(ResidentAuthGuard.name);

//   async canActivate(ctx: ExecutionContext): Promise<boolean> {
//     const req: Request & {
//       user: Record<string, any>;
//       customer?: AuthCustomer;
//     } = ctx.switchToHttp().getRequest();

//     const request = ctx.switchToHttp().getRequest();
//     const [type, token] = request.headers?.authorization?.split(' ') ?? [];
//     // const customer = await this.customerService.getCustomerDetailsbyToken(
//     // token,
//     // );
//     if (!true) {
//       this.logger.warn('failed to auth: no user object in request');
//       throw new UnauthorizedException('not authenticated!');
//     }

//     req.user = {
//       // id: customer.id,
//     };

//     return true;
//   }
// }
