import * as Joi from 'joi';
// import { CustomerAttributes } from '../../models/customer.model';
import { CustomerAttributes } from '../../models/customer.model';

export const validateCustomerEmail = Joi.object<
  Pick<CustomerAttributes, 'email'>
>({
  email: Joi.string().email().required(),
});

export const validateCreateCustomer = Joi.object<CustomerAttributes>({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required().max(13),
  passcode: Joi.string().required().max(6),
});

export const validateCustomerLogin = Joi.object<
  Pick<CustomerAttributes, 'email' | 'passcode'>
>({
  email: Joi.string().email().required(),
  passcode: Joi.string().required(),
});
