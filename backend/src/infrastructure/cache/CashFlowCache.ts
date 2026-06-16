interface CacheEntry {
  data: unknown;
  timestamp: number;
}

export class CashFlowCache {
  private static instance: CashFlowCache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxEntries = 5;
  private accessOrder: string[] = [];

  private constructor() {}

  static getInstance(): CashFlowCache {
    if (!CashFlowCache.instance) {
      CashFlowCache.instance = new CashFlowCache();
    }
    return CashFlowCache.instance;
  }

  get(key: string): unknown | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    this.touch(key);
    return entry.data;
  }

  set(key: string, data: unknown): void {
    if (this.cache.has(key)) {
      this.touch(key);
      this.cache.get(key)!.data = data;
      this.cache.get(key)!.timestamp = Date.now();
      return;
    }

    if (this.cache.size >= this.maxEntries) {
      const oldest = this.accessOrder.shift();
      if (oldest) this.cache.delete(oldest);
    }

    this.cache.set(key, { data, timestamp: Date.now() });
    this.accessOrder.push(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(clientId: string): void {
    this.cache.forEach((_, key) => {
      if (key.includes(clientId)) {
        this.cache.delete(key);
        this.accessOrder = this.accessOrder.filter(k => k !== key);
      }
    });
  }

  private touch(key: string): void {
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
      this.accessOrder.push(key);
    }
  }
}
