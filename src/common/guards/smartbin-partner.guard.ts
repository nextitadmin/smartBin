import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PspAdminUser, SmartbinPartnerUser } from '../types';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PspAuthService } from '@src/lawma/psp/auth/auth.service';
import { LawmaPartnerAuthService } from '@src/lawma/lawma-partner/auth/auth.service';
import { AdministratorRole } from '@models/administrator.model';

@Injectable()
export class SmartbinPartnerAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly reflector: Reflector,
    private readonly lawmaPartnerAuthService: LawmaPartnerAuthService,
  ) {}

  private logger = new Logger(SmartbinPartnerAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Record<string, any>;
      smartbinPartner?: SmartbinPartnerUser;
    } = ctx.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const [, token] = request.headers?.authorization?.split(' ') ?? [];

    const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Not Authorized');
    }

    const administrator =
      await this.lawmaPartnerAuthService.getAdminDetailsByToken(token);
    if (!administrator) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.smartbinPartner = {
      id: String(administrator._id),
      email: administrator.email,
      name: administrator.name,
      role: AdministratorRole.SmartBinPartner,
    };

    return true;
  }
}
