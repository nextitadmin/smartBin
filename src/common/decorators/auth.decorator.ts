import {
  ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';

import { AgentAuthGuard } from '../guards/agent.guard';
import { Request } from 'express';
import { AuthUser } from '../types';

export function AgentAuth() {
  return applyDecorators(UseGuards(AgentAuthGuard));
}

export function ResidentAuth() {
  return applyDecorators(UseGuards(AgentAuthGuard));
}

export function FacilityManagerAuth() {
  return applyDecorators(UseGuards(AgentAuthGuard));
}

export function CorporateAuth() {
  return applyDecorators(UseGuards(AgentAuthGuard));
}

export const AuthenticatedAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request & { agent: AuthUser } = ctx.switchToHttp().getRequest();
    return req.agent;
  },
);

export const AuthenticatedCorporate = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request & { corporate: AuthUser } = ctx
      .switchToHttp()
      .getRequest();
    return req.corporate;
  },
);
export const AuthenticatedFacilityManager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request & { facilityManager: AuthUser } = ctx
      .switchToHttp()
      .getRequest();
    return req.facilityManager;
  },
);
export const AuthenticatedResident = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request & { resident: AuthUser } = ctx
      .switchToHttp()
      .getRequest();
    return req.resident;
  },
);
