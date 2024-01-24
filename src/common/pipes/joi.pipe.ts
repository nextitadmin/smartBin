import {
  ArgumentMetadata,
  Injectable,
  InternalServerErrorException,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import joi from 'joi';
import { RequestValidationException } from '../errors';
import { ErrorResponseObject } from '../http';

const validationOptions: joi.ValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  private logger = new Logger(JoiValidationPipe.name);
  constructor(private schema: joi.ObjectSchema) {}

  async transform(value: Record<string, unknown>, meta: ArgumentMetadata) {
    try {
      const validated = await this.schema.validateAsync(
        value,
        validationOptions,
      );

      return validated;
    } catch (error) {
      this.logger.debug(error);
      if (error instanceof joi.ValidationError) {
        const errors = error.details.map((e) => ({
          message: e.message,
          field: e.context.label,
        }));

        throw new RequestValidationException(
          new ErrorResponseObject(
            `request ${meta.type} failed validation`,
            errors,
          ),
        );
      } else {
        this.logger.error(error);
        throw new InternalServerErrorException('An unknown error occured');
      }
    }
  }
}

export const JoiSchema = <T>(schema: joi.ObjectSchema<T>) =>
  new JoiValidationPipe(schema);
