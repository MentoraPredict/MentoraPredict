import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage<string>();

export const correlationContext = {
  run<T>(id: string, fn: () => T): T {
    return storage.run(id, fn);
  },
  getId(): string | undefined {
    return storage.getStore();
  },
};
