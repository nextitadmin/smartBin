import { Body, Controller, Post } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { SuccessResponse } from '@common/http';

@Controller({ path: 'providers', version: '1' })
export class ProviderController {}
