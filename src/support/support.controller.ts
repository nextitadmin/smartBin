import {
    Controller,
    Post,
    Body,
    UploadedFile,
    UseInterceptors,
    HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportService } from './support.service';
import { CreateSupportRequestDto } from './dtos/support-request.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import path from 'path';


@ApiTags('Support')
@Controller({
    path: 'support',
    version: '1'
})
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('contact')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fullName: { type: 'string' },
                phoneNumber: { type: 'string' },
                email: { type: 'string' },
                message: { type: 'string' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Send support mail' })
    @HttpCode(200)
    async sendSupportMail(
        @Body() dto: CreateSupportRequestDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.supportService.sendMailToSupport(dto, file);
    }
}
