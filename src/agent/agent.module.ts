import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '@models/users/agent.model';
import { Payer, PayerSchema } from '@models/users/payer.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Agent.name,
        schema: AgentSchema,
      },
      {
        name: Payer.name,
        schema: PayerSchema,
      },
    ]),
  ],
  providers: [AgentService],
  exports: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
