import { encoder, generateRandomChars } from '.';

describe('common/utils', () => {
  describe('generateRandomChars', () => {
    it('should generate random alpha', async () => {
      const rand = generateRandomChars(10, 'alphabet');

      expect(rand.length).toBe(10);
      expect(rand).toMatch(/^[a-z]+$/gi);
    });

    it('should generate random alphanum', async () => {
      const rand = generateRandomChars(10, 'alphanum');

      expect(rand.length).toBe(10);
      expect(rand).toMatch(/^[a-z0-9]+$/gi);
    });

    it('should generate random number', async () => {
      const rand = generateRandomChars(10, 'number');

      expect(rand.length).toBe(10);
      expect(rand).toMatch(/^[0-9]+$/gi);
    });

    it('should generate chars', async () => {
      const rand = generateRandomChars(20, 'any');

      expect(rand.length).toBe(20);
    });

    it('should generate 16 alphanum by default', async () => {
      const rand = generateRandomChars();

      expect(rand.length).toBe(16);
      expect(rand).toMatch(/^[a-z0-9]+$/gi);
    });
  });

  describe('encoder', () => {
    it('should encode appropriately', async () => {
      const encoded = encoder.encode('testData');

      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
    });

    it('should decode appropriately', async () => {
      const encoded = encoder.encode('testData');
      const decoded = encoder.decode(encoded);

      expect(decoded).toBeDefined();
      expect(decoded).toEqual('testData');
    });
  });
});
