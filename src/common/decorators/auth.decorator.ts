import {
  ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';

import { CustomerAuthGuard } from '../guards/auth.guard';
import { Request } from 'express';
import { AuthCustomer } from '../types';

export function CustomerAuth() {
  return applyDecorators(UseGuards(CustomerAuthGuard));
}

export const AuthenticatedCustomer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request & { customer: AuthCustomer } = ctx
      .switchToHttp()
      .getRequest();

    return req.customer;
  },
);
