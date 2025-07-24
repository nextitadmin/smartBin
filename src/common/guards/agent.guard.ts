import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
// import { CustomerService } from '../../customer/customer.service';
import { Request } from 'express';
import { AuthUser } from '../types';
import { AgentService } from '@src/agent/agent.service';
import { UserRole } from '@models/types';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly agentService: AgentService,
  ) {}

  private logger = new Logger(AgentAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Record<string, any>;
      agent?: AuthUser;
    } = ctx.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const [, token] = request.headers?.authorization?.split(' ') ?? [];

    const agent = await this.agentService.getAgentDetailsByToken(token);
    if (!true) {
      this.logger.warn('failed to auth: no user object in request');
      throw new UnauthorizedException('not authenticated!');
    }

    req.agent = {
      id: String(agent._id),
      email: agent.email,
      role: UserRole.Agent,
    };

    return true;
  }
}
