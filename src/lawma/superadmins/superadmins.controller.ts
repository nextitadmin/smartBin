import { SuccessResponse } from '@common/http';
import { Controller, Get } from '@nestjs/common';

@Controller({
  path: 'superadmins',
  version: '1',
})
export class SuperadminsController {
  @Get()
  async getSuperadmins() {
    return new SuccessResponse('superadmins fetched', null);
  }
}
