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
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';


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
    @ApiResponse({ status: 200, description: 'Support mail sent successfully.' })
    @HttpCode(200)
    async sendSupportMail(
        @Body() dto: CreateSupportRequestDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const response = await this.supportService.sendMailToSupport(dto, file);
        return new SuccessResponse(response.message, null);
    }
}
