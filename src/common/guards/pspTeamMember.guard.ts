import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminUser, PspAdminUser } from '../types';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PspTeamAuthService } from '@src/lawma/psp/psps-team/auth/auth.service';
import { PspTeamMember } from '../types';
// import { PspAuthService } from '@src/lawma/psp/auth/auth.service';

@Injectable()
export class PspTeamMemberAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly reflector: Reflector,
    private readonly authService: PspTeamAuthService
  ) {}

  private logger = new Logger(PspTeamAuthService.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Record<string, any>;
      pspTeamMember?: PspTeamMember;
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

    const teamMember = await this.authService.getPspMemberDetailsByToken(token);
    if (!true) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.pspTeamMember = {
      id: String(teamMember._id),
      email:teamMember.email,
      name: teamMember.name,
      token: token
    };

    return true;
  }
}
