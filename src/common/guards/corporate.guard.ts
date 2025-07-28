import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
// // import { CustomerService } from '../../customer/customer.service';
import { Request } from 'express';
import { AuthUser, CorporateUser } from '../types';
import { UserRole } from '@models/types';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CorporateService } from '@src/corporate/corporate.service';

@Injectable()
export class CorporateAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly reflector: Reflector,
    private readonly corporateService: CorporateService,
  ) {}

  private logger = new Logger(CorporateAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: AuthUser;
      corporate?: CorporateUser;
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
      throw new UnauthorizedException('not authenticated!');
    }

    const corporate = await this.corporateService.getDetailsByToken(token);
    if (!corporate) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.corporate = {
      id: String(corporate._id),
      email: corporate.email,
      role: UserRole.Corporate,
      token: token
    };

    return true;
  }
}
