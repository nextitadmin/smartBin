import { decrypt, encrypt } from './encryption';

describe('common/encryption', () => {
  const encryptionKey = 'test-key';
  const data = JSON.stringify({ name: 'test' });

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      const encrypted = await encrypt({ data, salt: encryptionKey });

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });
  });

  describe('decrypt', () => {
    it('should decrypt data successfully', async () => {
      const encrypted = await encrypt({ data, salt: encryptionKey });
      const decrypted = await decrypt({ data: encrypted, salt: encryptionKey });

      expect(decrypted).toBeDefined();
      expect(decrypted).toEqual(data);
    });

    it('should throw if invalid encryption key', async () => {
      try {
        const encrypted = await encrypt({ data, salt: encryptionKey });
        const decrypted = await decrypt({ data: encrypted, salt: 'wrongkey' });

        expect(decrypted).not.toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
