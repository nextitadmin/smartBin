import * as crypto from 'crypto';
import { customAlphabet, nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { access, readFileSync } from 'fs';
import { join } from 'path';
import * as nunjucks from 'nunjucks';
import { CustomerAttributes } from '../../models/customer.model';
import { JwtService } from '@nestjs/jwt';

export const encoder = {
  encode: (data: string, encoding: BufferEncoding = 'base64') => {
    return Buffer.from(data, 'utf8').toString(encoding);
  },
  decode: (encoded: string, encoding: BufferEncoding = 'base64') => {
    return Buffer.from(encoded, encoding).toString('utf8');
  },
};

type Chars = 'alphabet' | 'number' | 'alphanum' | 'any';
export const generateRandomChars = (
  length = 16,
  chars: Chars = 'alphanum',
): string => {
  const lowerAlpha = Array(26)
    .fill(null)
    .map((_, i) => String.fromCharCode(i + 97))
    .join('');
  const upperAlpha = lowerAlpha.toUpperCase();
  const num = '0123456789';

  switch (chars) {
    case 'alphabet':
      return customAlphabet(`${lowerAlpha}${upperAlpha}`)(length);
    case 'number':
      return customAlphabet(`${num}`)(length);
    case 'any':
      return nanoid(length);
    default:
      return customAlphabet(`${num}${lowerAlpha}${upperAlpha}`)(length);
  }
};

export const sha256 = (data: string) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const comparePassword = (password: string, customerPassword: string) => {
  return bcrypt.compareSync(password, customerPassword);
};

export const getHashedPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

export const getCustomerToken = (
  customer: Partial<CustomerAttributes> & { accessType?: string },
  jwtService: JwtService,
) => {
  const payload = {
    email: customer.email,
    sub: {
      id: String(customer._id),
      tag: customer.tag,
      status: customer.status,
      ...(customer.accessType && { accessType: customer.accessType }),
    },
  };
  return jwtService.sign(payload);
};

export const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const compileTemplateWithData = (templateName: string, data: any) => {
  const templateString = readFileSync(
    join(__dirname, `../../../assets/${templateName}.html`),
  ).toString();

  const compiledData = nunjucks.renderString(templateString, data);
  return compiledData;
};

export const parseAmountToNumber = (amount: string) => {
  return Number(amount.replace(/[^0-9.-]+/g, ''));
};
