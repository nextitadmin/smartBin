import { Model } from 'sequelize';

export const mockModel: Partial<{
  [P in keyof Omit<
    typeof Model,
    | 'associations'
    | 'options'
    | 'primaryKeyAttribute'
    | 'primaryKeyAttributes'
    | 'prototype'
    | 'sequelize'
    | 'tableName'
    | 'rawAttributes'
  >]: jest.Mock;
}> = Object.getOwnPropertyNames(Model)
  .filter((k) => !/^\_/gi.test(k))
  .filter(
    (k) =>
      typeof Object.getOwnPropertyDescriptor(Model, k).value === 'function',
  )
  .reduce((a, c) => ({ ...a, [c]: jest.fn() }), {});
