/* Simple server side in-memory cache with TTL
 * Written by claude https://claude.ai/chat/41a2748f-0159-4fda-ab1c-013fd64231ec
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const maxAge = ttl ?? this.defaultTTL;
    const isExpired = Date.now() - entry.timestamp > maxAge;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const cache = new InMemoryCache();
