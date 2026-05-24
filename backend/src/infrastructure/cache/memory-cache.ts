const cacheStore = new Map<string, any>();

export const memoryCache = {
  get(key: string) {
    return cacheStore.get(key);
  },
  set(key: string, value: any) {
    cacheStore.set(key, value);
    return value;
  },
  clear() {
    cacheStore.clear();
  },
};
