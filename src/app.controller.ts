import { SuccessResponse } from '@common/http';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller({
  path: 'app',
  version: '1',
})
export class AppController {
  @Get('/health')
  getHealth() {
    return new SuccessResponse('health is wealth', null);
  }
}
