import { Injectable, signal } from '@angular/core';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = signal<Map<string, CacheEntry<any>>>(new Map());

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache().get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.update(cache => {
        cache.delete(key);
        return new Map(cache);
      });
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.update(cache => {
      cache.set(key, entry);
      return new Map(cache);
    });
  }

  /**
   * Check if key exists in cache and hasn't expired
   */
  has(key: string): boolean {
    const entry = this.cache().get(key);
    return entry ? (Date.now() - entry.timestamp <= entry.ttl) : false;
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): void {
    this.cache.update(cache => {
      cache.delete(key);
      return new Map(cache);
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.set(new Map());
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    this.cache.update(cache => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          cache.delete(key);
        }
      }
      return new Map(cache);
    });
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache().size;
  }

  /**
   * Generate cache key from URL and params
   */
  generateKey(url: string, params?: any): string {
    let key = url;
    if (params) {
      key += '?' + new URLSearchParams(params).toString();
    }
    return key;
  }

  /**
   * Cache with automatic key generation
   */
  getWithKey<T>(url: string, params?: any): T | null {
    const key = this.generateKey(url, params);
    return this.get<T>(key);
  }

  /**
   * Set with automatic key generation
   */
  setWithKey<T>(url: string, data: T, params?: any, ttl?: number): void {
    const key = this.generateKey(url, params);
    this.set(key, data, ttl);
  }
}