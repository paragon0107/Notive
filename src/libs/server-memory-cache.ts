type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const valueCache = new Map<string, CacheEntry>();
const pendingCache = new Map<string, Promise<unknown>>();

const readValidEntry = (key: string) => {
  const entry = valueCache.get(key);
  if (!entry) return undefined;

  if (Date.now() >= entry.expiresAt) {
    valueCache.delete(key);
    return undefined;
  }

  return entry;
};

export const getOrSetMemoryCache = async <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> => {
  const entry = readValidEntry(key);
  if (entry) return entry.value as T;

  const pending = pendingCache.get(key);
  if (pending) return pending as Promise<T>;

  const request = loader()
    .then((value) => {
      if (ttlMs > 0) {
        valueCache.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
      }
      return value;
    })
    .finally(() => {
      pendingCache.delete(key);
    });

  pendingCache.set(key, request as Promise<unknown>);
  return request;
};
