import {
  Controller,
  Get
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';

@ApiTags('Utilities')
@Controller({
  path: 'utility',
  version: '1',
})
export class UtilityController {
  constructor() {}

  @Get('get-states')
  async getStates() {
    const data = ['Lagos'];
    return new SuccessResponse('list of states fetched successfully', data);
  }

  @Get('get-lgas')
  async getLgas() {
    const data = [
      'Agege',
      'Ajeromi-Ifelodun',
      'Alimosho',
      'Amuwo-Odofin',
      'Apapa',
      'Badagry',
      'Epe',
      'Eti-Osa',
      'Ibeju-Lekki',
      'Ifako-Ijaiye',
      'Ikeja',
      'Ikorodu',
      'Kosofe',
      'Lagos Island',
      'Lagos Mainland',
      'Mushin',
      'Ojo',
      'Oshodi-Isolo',
      'Shomolu',
      'Surulere',
    ];
    return new SuccessResponse(
      'list of local government fetched successfully',
      data,
    );
  }
}
