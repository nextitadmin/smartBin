import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { SuccessResponse } from '@common/http';

@ApiTags('Media')
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadMedia(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({ maxSize: 3000000, message:'File cannot be greater than 1MB' })
        .build(
          {
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
          }
        ),
    )
    file: Express.Multer.File,
  ) {
    const response = await this.mediaService.fileUpload(file.buffer);
    return new SuccessResponse(response.message, response);
  }
}
