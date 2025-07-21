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

@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(private readonly agentService: AgentService) {}

  private logger = new Logger(AgentAuthGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & {
      user: Record<string, any>;
      agent?: AuthUser;
    } = ctx.switchToHttp().getRequest();

    const request = ctx.switchToHttp().getRequest();
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];

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
