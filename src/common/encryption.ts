import {
  CipherGCMTypes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from 'crypto';
import { generateRandomChars } from './utils';

interface EncryptionOptions {
  data: string;
  salt: string;
  algorithm?: CipherGCMTypes;
}

export const encrypt = ({
  data,
  salt,
  algorithm = 'aes-256-gcm',
}: EncryptionOptions): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const iv = generateRandomChars(16, 'any');
      const key = createHash('sha256').update(salt).digest();
      const cipher = createCipheriv(algorithm, key, iv);

      const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final(),
      ]).toString('base64url');
      const authTag = cipher.getAuthTag().toString('base64url');

      const encodeData = `${iv}::${authTag}::${encrypted}`;
      const encoded = Buffer.from(encodeData).toString('base64');
      // base64(iv::authTag::enc)

      resolve(encoded);
    } catch (error) {
      reject(error);
    }
  });

export const decrypt = ({
  data,
  salt,
  algorithm = 'aes-256-gcm',
}: EncryptionOptions): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const key = createHash('sha256').update(salt).digest();
      const [iv, authTag, encrypted] = Buffer.from(data, 'base64')
        .toString()
        .split('::');

      const decipher = createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(Buffer.from(authTag, 'base64url'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'base64url')),
        decipher.final(),
      ]).toString();

      resolve(decrypted);
    } catch (error) {
      reject(error);
    }
  });
