interface CacheEntry<T> {
  data: T;
  timestamp: number;
  queryParams: string;
}

export class CacheManager {
  private static instance: CacheManager | null = null;
  private cache: Map<string, CacheEntry<unknown>>;
  private readonly CACHE_DURATION: number = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public set<T>(key: string, data: T, queryParams: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      queryParams,
    });
  }

  public get<T>(key: string, queryParams: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (entry.queryParams !== queryParams) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const clearCache = (): void => {
  CacheManager.getInstance().clear();
};
