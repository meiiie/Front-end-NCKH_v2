import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../shared/types/user.types';
import { ApiClient } from '../client/api-client';
import { AUTH_ENDPOINTS } from '../endpoints/auth.endpoints';
import { AuthenticationResponse } from '../types/auth.types';

// Track token refresh state to prevent multiple concurrent refresh requests
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiClient = inject(ApiClient);
  const router = inject(Router);

  // Skip interceptor for auth endpoints (login, register, refresh)
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Add authorization header if token exists
  const accessToken = getAccessToken();
  let authReq = req;

  if (accessToken) {
    authReq = addTokenToRequest(req, accessToken);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // If already refreshing, wait for the refresh to complete
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            return next(addTokenToRequest(req, token!));
          }),
          catchError(err => {
            // If refresh failed, logout user
            handleRefreshFailure();
            return throwError(() => err);
          })
        );
      }

      // Start token refresh process
      isRefreshing = true;
      refreshTokenSubject.next(null);

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, logout
        handleRefreshFailure();
        return throwError(() => error);
      }

      return performTokenRefresh(refreshToken).pipe(
        switchMap((response: AuthenticationResponse) => {
          // Token refresh successful
          isRefreshing = false;

          // Map backend user to frontend user format
          const mappedUser = mapBackendUserToFrontend(response.user);

          // Update tokens in auth service
          authService.setUser(mappedUser);
          setTokens(response.accessToken, response.refreshToken);

          // Update the subject with new token
          refreshTokenSubject.next(response.accessToken);

          // Retry the original request with new token
          return next(addTokenToRequest(req, response.accessToken));
        }),
        catchError(refreshError => {
          // Token refresh failed
          isRefreshing = false;
          refreshTokenSubject.next(null);

          handleRefreshFailure();
          return throwError(() => refreshError);
        })
      );
    })
  );
};

/**
 * Check if the request URL is an auth endpoint that shouldn't be intercepted
 */
function isAuthEndpoint(url: string): boolean {
  const authUrls = [
    AUTH_ENDPOINTS.LOGIN,
    AUTH_ENDPOINTS.REGISTER,
    AUTH_ENDPOINTS.REFRESH,
    AUTH_ENDPOINTS.LOGOUT
  ];

  return authUrls.some(endpoint => url.includes(endpoint));
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('refresh_token');
  }
  return null;
}

/**
 * Set tokens in localStorage
 */
function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
}

/**
 * Add authorization header to request
 */
function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Perform token refresh API call
 */
function performTokenRefresh(refreshToken: string): Observable<AuthenticationResponse> {
  const apiClient = inject(ApiClient);

  return apiClient.post<AuthenticationResponse>(
    AUTH_ENDPOINTS.REFRESH,
    { refreshToken }
  );
}

/**
 * Handle token refresh failure - logout user
 */
function handleRefreshFailure(): void {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clear authentication state
  authService.logout();

  // Navigate to login (logout already handles navigation)
  // router.navigate(['/auth/login']);
}

/**
 * Map backend user format to frontend User format
 */
function mapBackendUserToFrontend(backendUser: any): User {
  return {
    id: backendUser.id,
    username: backendUser.username,
    email: backendUser.email,
    fullName: backendUser.fullName,
    role: mapBackendRole(backendUser.role),
    enabled: backendUser.enabled,
    avatar: getDefaultAvatar(backendUser.email),
    department: getDepartmentFromRole(backendUser.role),
    studentId: backendUser.role === 'STUDENT' ? generateStudentId() : undefined,
    createdAt: backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updatedAt || new Date().toISOString()
  };
}

/**
 * Helper functions for user mapping
 */
function mapBackendRole(backendRole: string): UserRole {
  switch (backendRole.toUpperCase()) {
    case 'STUDENT': return UserRole.STUDENT;
    case 'TEACHER': return UserRole.TEACHER;
    case 'ADMIN': return UserRole.ADMIN;
    default: return UserRole.STUDENT;
  }
}

function getDefaultAvatar(email: string): string {
  const name = email.split('@')[0];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=150`;
}

function getDepartmentFromRole(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT: return 'Khoa Hàng hải';
    case UserRole.TEACHER: return 'Khoa Hàng hải';
    case UserRole.ADMIN: return 'Phòng Quản trị';
    default: return 'Khoa Hàng hải';
  }
}

function generateStudentId(): string {
  return 'SV' + new Date().getFullYear() + Math.random().toString(36).substr(2, 4).toUpperCase();
}