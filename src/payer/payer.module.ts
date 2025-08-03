import { Module } from '@nestjs/common';
import { PayerService } from './payer.service';
import { PayerController } from './payer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payer, PayerSchema } from '@models/users/payer.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Payer.name,
        schema: PayerSchema,
      },
    ]),
  ],
  controllers: [PayerController],
  providers: [PayerService],
  exports: [PayerService],
})
export class PayerModule {}
