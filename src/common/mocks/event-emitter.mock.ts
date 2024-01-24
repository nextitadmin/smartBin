import { EventEmitter2 } from '@nestjs/event-emitter';

export const mockEmitter: Partial<jest.Mocked<EventEmitter2>> =
  Object.getOwnPropertyNames(EventEmitter2.prototype)
    .filter((k) => !/^\_/gi.test(k))
    .filter((k) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        EventEmitter2.prototype,
        k,
      );

      return descriptor.enumerable && typeof descriptor.value === 'function';
    })
    .reduce((a, c) => ({ ...a, [c]: jest.fn() }), {});
