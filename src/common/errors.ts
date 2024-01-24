import { ErrorResponseObject } from './http';

export class RequestValidationException {
  constructor(public errorObject: ErrorResponseObject) {}
}
