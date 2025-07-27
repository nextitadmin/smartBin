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
import { AuthUser, FacilityManagerUser } from '../types';
import { UserRole } from '@models/types';
import { FacilityManagerService } from '@src/facility-manager/facility-manager.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FacilityManagerAuthGuard implements CanActivate {
  constructor(
    private readonly facilityManager: FacilityManagerService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  private logger = new Logger(FacilityManagerAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Partial<AuthUser>;
      facilityManager?: FacilityManagerUser;
    } = ctx.switchToHttp().getRequest();

    const request = ctx.switchToHttp().getRequest();
    const [_, token] = request.headers?.authorization?.split(' ') ?? [];

    const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Not Authorized');
    }

    const facilityManager =
      await this.facilityManager.getFacilityManagerDetailsByToken(token);
    if (!facilityManager) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.facilityManager = {
      id: String(facilityManager._id),
      email: facilityManager.email,
      role: UserRole.Facility,
      token: token,
    };

    return true;
  }
}
