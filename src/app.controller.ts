import { SuccessResponse } from '@common/http';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// import { AppService } from './app.service';

@ApiTags('App')
@Controller({
  path: 'app',
  version: '1',
})
export class AppController {
  //   constructor(private readonly appService: AppService) {}
  //   @Get('/health')
  //   getHealth() {
  //     return new SuccessResponse('health is wealth', null);
  //   }
  // }
}
