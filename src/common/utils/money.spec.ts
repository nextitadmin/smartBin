import { getAllocationRatio, toSubUnit } from './money';

describe('common/utils/money', () => {
  describe('toSubUnit', () => {
    it('should return subunit of amount', async () => {
      const dataSet = [
        { unit: 10000, expected: 1000000, got: 0 },
        { unit: 196775, expected: 19677500, got: 0 },
        { unit: 15500, expected: 1550000, got: 0 },
        { unit: 42.2, expected: 4220, got: 0 },
        { unit: 929.45, expected: 92945, got: 0 },
        { unit: 1000.05, expected: 100005, got: 0 },
      ];

      dataSet.forEach((sample) => {
        sample.got = toSubUnit(sample.unit);
        expect(sample.got).toEqual(sample.expected);
      });
    });
  });

  describe('getAllocationRatio', () => {
    it('should return equal ratios for eligible figures', async () => {
      const expected = [25, 25, 25, 25];
      const got = getAllocationRatio(4);

      expect(got).toEqual(expected);
    });

    it('should return unequal ratios where applicable', async () => {
      const expected = [33, 33, 34];
      const got = getAllocationRatio(3);

      expect(got).toEqual(expected);
    });

    it('should allocate based on max figure', async () => {
      const expected = [25, 25, 25];
      const got = getAllocationRatio(3, 75);

      expect(got).toEqual(expected);
    });

    it('should allocate appropriately for max decimal figures', async () => {
      const expected = [20, 20.5];
      const got = getAllocationRatio(2, 40.5);

      expect(got).toEqual(expected);
    });

    it('should not allocate if number of allocations > max limit', async () => {
      const expected = [];
      const got = getAllocationRatio(25, 20);

      expect(got).toEqual(expected);
    });
  });
});
