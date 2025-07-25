import { AuthUser } from '@common/types';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ResidentUser } from '../types';
import { UserRole } from '@models/types';
import { ResidentService } from '@src/resident/resident.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';

@Injectable()
export class ResidentAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly reflector: Reflector,
    private readonly residentService: ResidentService,
  ) {}

  private logger = new Logger(ResidentAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: AuthUser;
      resident?: ResidentUser;
    } = ctx.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const [_, token] = request.headers?.authorization?.split(' ') ?? [];
    const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Not Authorized');
    }

    const resident = await this.residentService.getResidentDetailsByToken(
      token,
    );
    if (!resident) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.resident = {
      id: String(resident._id),
      email: resident.email,
      role: UserRole.Resident,
      token: token,
    };

    return true;
  }
}
