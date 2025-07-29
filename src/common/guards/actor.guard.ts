import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { IS_PUBLIC_KEY } from './public.guard';
import {
  AgentUser,
  AuthUser,
  CorporateUser,
  FacilityManagerUser,
  ResidentUser,
} from '@common/types';
import { UserRole } from '@models/types';

// import your 4 services
import { ResidentService } from '@src/resident/resident.service';
import { AgentService } from '@src/agent/agent.service';
import { CorporateService } from '@src/corporate/corporate.service';
import { FacilityManagerService } from '@src/facility-manager/facility-manager.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  private AUTHENTICATION_ERROR_MESSAGE = 'Invalid authentication token';

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly reflector: Reflector,
    private readonly residentService: ResidentService,
    private readonly agentService: AgentService,
    private readonly corporateService: CorporateService,
    private readonly facilityManagerService: FacilityManagerService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & { user?: AuthUser } = ctx.switchToHttp().getRequest();

    // Skip if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const [_, token] = request.headers?.authorization?.split(' ') ?? [];
    if (!token)
      throw new UnauthorizedException(this.AUTHENTICATION_ERROR_MESSAGE);

    const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
    if (isBlacklisted)
      throw new UnauthorizedException(this.AUTHENTICATION_ERROR_MESSAGE);

    // Try authenticating against all user types
    const strategies = [
      {
        role: UserRole.Resident,
        service: this.residentService,
        method: 'getResidentDetailsByToken',
      },
      {
        role: UserRole.Agent,
        service: this.agentService,
        method: 'getAgentByToken',
      },
      {
        role: UserRole.Corporate,
        service: this.corporateService,
        method: 'getCorporateByToken',
      },
      {
        role: UserRole.Facility,
        service: this.facilityManagerService,
        method:
          this.facilityManagerService.getFacilityManagerDetailsByToken.name,
      },
    ];

    for (const strat of strategies) {
      // @ts-ignore — dynamic service method call
      const user = await strat.service[strat.method](token).catch(() => null);
      if (!user) {
        this.logger.warn('failed to auth: no matching user found');
        throw new UnauthorizedException(this.AUTHENTICATION_ERROR_MESSAGE);
      }

      req.user = {
        id: String(user._id),
        email: user.email,
        role: strat.role,
        token,
      } satisfies
        | AuthUser
        | CorporateUser
        | AgentUser
        | FacilityManagerUser
        | ResidentUser;
      return true;
    }
  }
}
