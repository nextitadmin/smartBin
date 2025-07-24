import {
  Controller,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Media')
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    throw new UnprocessableEntityException('Not implemented 😭');
  }
}
