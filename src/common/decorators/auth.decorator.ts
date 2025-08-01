import {
  ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';

import { AgentAuthGuard } from '../guards/agent.guard';
import { ResidentAuthGuard } from '../guards/resident.guard';
import { FacilityManagerAuthGuard } from '../guards/facility-manager.guard';
import { CorporateAuthGuard } from '../guards/corporate.guard';
import { Request } from 'express';
import { AuthUser } from '../types';
import { AuthGuard } from '@common/guards/actor.guard';

export function AgentAuth() {
  return applyDecorators(UseGuards(AgentAuthGuard));
}

export function ResidentAuth() {
  return applyDecorators(UseGuards(ResidentAuthGuard));
}

export function FacilityManagerAuth() {
  return applyDecorators(UseGuards(FacilityManagerAuthGuard));
}

export function CorporateAuth() {
  return applyDecorators(UseGuards(CorporateAuthGuard));
}

export function Auth() {
  return applyDecorators(UseGuards(AuthGuard));
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

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request & { user: AuthUser } = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
