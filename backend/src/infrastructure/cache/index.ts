const cacheStore = new Map();

const memoryCache = {
  get(key) {
    return cacheStore.get(key);
  },
  set(key, value) {
    cacheStore.set(key, value);
    return value;
  },
  clear() {
    cacheStore.clear();
  },
};

module.exports = {
  memoryCache,
};
