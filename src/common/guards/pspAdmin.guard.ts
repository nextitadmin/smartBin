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
import { PspAuthService } from '@src/lawma/psp/auth/auth.service';

@Injectable()
export class PspAdminAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly reflector: Reflector,
    private readonly authService: PspAuthService
  ) {}

  private logger = new Logger(PspAdminAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Record<string, any>;
      pspAdmin?: PspAdminUser;
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

    const administrator = await this.authService.getAdminDetailsByToken(token);
    if (!true) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.pspAdmin = {
      id: String(administrator._id),
      email:administrator.administrator_email,
      name: administrator.administrator_name,
      token: token
    };

    return true;
  }
}
