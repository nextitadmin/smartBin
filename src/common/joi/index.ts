import { Provider, SetMetadata } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import joi from 'joi';
import { JoiInterceptor } from './joi.interceptor';

export type SchemaType = 'body' | 'query' | 'params';

const Schema = <T>(type: SchemaType, schema: joi.ObjectSchema<T>) =>
  SetMetadata(`joi_${type}_schema`, { type, schema });

export const BodySchema = <T>(s: joi.ObjectSchema<T>) => Schema('body', s);
export const QuerySchema = <T>(s: joi.ObjectSchema<T>) => Schema('query', s);
export const ParamSchema = <T>(s: joi.ObjectSchema<T>) => Schema('params', s);

export const appValidationProvider: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: JoiInterceptor,
};
