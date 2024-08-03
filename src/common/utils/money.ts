import DineroFactory from 'dinero.js';
import { Model } from 'sequelize-typescript';

export const Money = DineroFactory;
Money.defaultCurrency = 'NGN';
Money.defaultPrecision = 2;
export type Money = DineroFactory.Dinero;
export type Currency = DineroFactory.Currency;
export const Currency = (c: string): Currency => {
  return c?.trim()?.toUpperCase() as Currency;
};

/**
 * converts amount passed to subunit e.g Naira to Kobo, Dollar to cents
 */
export const toSubUnit = (amount: number, precision = 2): number => {
  const multiplier = 10 ** precision;
  return +`${amount * multiplier}`.split('.')[0];
};

export const setMoney = <M extends Model>(
  model: M,
  field: keyof M,
  amount: Money,
) => {
  if (Number.isNaN(amount)) return;
  model.setDataValue(field, amount.getAmount());
};

export const getMoney = <M extends Model>(model: M, field: keyof M) => {
  const amount = +model.getDataValue(field);
  if (Number.isNaN(amount)) return;

  const currency: Currency = model.getDataValue('currency') || Currency('NGN');
  return Money({ amount, currency });
};

/**
 * returns mostly whole ratios for allocating money
 */
export const getAllocationRatio = (num: number, limit = 100) => {
  if (num > limit) {
    return [];
  }

  if (!(limit % num)) {
    return Array<number>(num).fill(limit / num);
  }

  const wholeRatio = +(limit / num).toString().split('.')[0];
  const ratios = Array<number>(num - 1).fill(wholeRatio);
  const lastRatio = limit - ratios.reduce((a, c) => a + c, 0);
  return [...ratios, lastRatio];
};
