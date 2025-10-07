import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../types/common.types';
import { CacheService } from '../../core/services/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ApiClient {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
  private readonly baseUrl = environment.apiUrl;

  constructor() {}

  get<T>(endpoint: string, options?: any): Observable<T> {
    const cacheKey = this.cache.generateKey(endpoint, options?.params);
    const cachedData = this.cache.get<T>(cacheKey);

    if (cachedData !== null) {
      return of(cachedData);
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options).pipe(
      map(response => response as unknown as T),
      tap(data => {
        // Cache GET requests for 5 minutes by default
        const ttl = options?.cache?.ttl || 5 * 60 * 1000;
        this.cache.set(cacheKey, data, ttl);
      }),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, options).pipe(
      map(response => response as unknown as T),
      tap(() => this.invalidateRelatedCache(endpoint)),
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, options).pipe(
      map(response => response as unknown as T),
      tap(() => this.invalidateRelatedCache(endpoint)),
      catchError(this.handleError)
    );
  }

  patch<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, options).pipe(
      map(response => response as unknown as T),
      tap(() => this.invalidateRelatedCache(endpoint)),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string, options?: any): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options).pipe(
      map(response => response as unknown as T),
      tap(() => this.invalidateRelatedCache(endpoint)),
      catchError(this.handleError)
    );
  }

  // Helper method for API responses with standard format
  getWithResponse<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, options).pipe(
      map(response => response as unknown as ApiResponse<T>),
      catchError(this.handleError)
    );
  }

  postWithResponse<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, options).pipe(
      map(response => response as unknown as ApiResponse<T>),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Invalidate cache entries related to the modified endpoint
   */
  private invalidateRelatedCache(endpoint: string): void {
    // Clear cache entries that might be affected by this change
    // For example, if we update a course, clear course-related cache
    const cacheKeys = Array.from(this.cache['cache']().keys());

    cacheKeys.forEach(key => {
      if (key.includes(endpoint) ||
          this.isRelatedEndpoint(key, endpoint)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Check if two endpoints are related (e.g., course list and specific course)
   */
  private isRelatedEndpoint(cachedKey: string, modifiedEndpoint: string): boolean {
    // Simple relationship check - can be enhanced based on API structure
    const relationships = [
      { pattern: '/courses', related: ['/courses/', '/my-courses'] },
      { pattern: '/assignments', related: ['/assignments/', '/my-assignments'] },
      { pattern: '/users', related: ['/users/', '/profile'] },
    ];

    for (const relation of relationships) {
      if (modifiedEndpoint.includes(relation.pattern)) {
        return relation.related.some(related =>
          cachedKey.includes(related) || related.includes(cachedKey.split('?')[0])
        );
      }
    }

    return false;
  }
}