import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen, tap } from 'rxjs/operators';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  context?: string;
  code?: string;
  retryable?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private router = inject(Router);
  
  // Error state management
  private _errors = signal<AppError[]>([]);
  private _isLoading = signal<boolean>(false);
  
  // Readonly signals
  readonly errors = this._errors.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly hasErrors = signal(this._errors().length > 0);

  /**
   * Add a new error to the error list
   */
  addError(error: Omit<AppError, 'id' | 'timestamp'>): void {
    const newError: AppError = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      retryable: this.isRetryableError(error),
      ...error
    };

    this._errors.update(errors => [...errors, newError]);

    // Auto-remove info messages after 5 seconds
    if (error.type === 'info') {
      setTimeout(() => this.removeError(newError.id), 5000);
    }

    // Auto-remove warnings after 10 seconds
    if (error.type === 'warning') {
      setTimeout(() => this.removeError(newError.id), 10000);
    }

    console.error('🚨 App Error:', newError);
  }

  /**
   * Remove an error by ID
   */
  removeError(errorId: string): void {
    this._errors.update(errors => errors.filter(error => error.id !== errorId));
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this._errors.set([]);
  }

  /**
   * Handle navigation errors
   */
  handleNavigationError(error: any, route: string): void {
    this.addError({
      message: `Không thể điều hướng đến ${route}. Vui lòng thử lại.`,
      type: 'error',
      context: 'navigation',
      action: {
        label: 'Thử lại',
        handler: () => this.router.navigate([route])
      }
    });
  }

  /**
   * Handle API errors
   */
  handleApiError(error: any, context: string): void {
    let message = 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.';
    
    if (error.status === 404) {
      message = 'Không tìm thấy dữ liệu yêu cầu.';
    } else if (error.status === 403) {
      message = 'Bạn không có quyền truy cập vào tài nguyên này.';
    } else if (error.status === 500) {
      message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
    } else if (error.status === 0) {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    
    this.addError({
      message,
      type: 'error',
      context,
      action: {
        label: 'Tải lại',
        handler: () => window.location.reload()
      }
    });
  }

  /**
   * Handle form validation errors
   */
  handleValidationError(errors: any, formName: string): void {
    const errorMessages = Object.values(errors).flat();
    const message = `Lỗi xác thực trong ${formName}: ${errorMessages.join(', ')}`;
    
    this.addError({
      message,
      type: 'warning',
      context: 'validation'
    });
  }

  /**
   * Show success message
   */
  showSuccess(message: string, context?: string): void {
    this.addError({
      message,
      type: 'info',
      context
    });
  }

  /**
   * Show warning message
   */
  showWarning(message: string, context?: string): void {
    this.addError({
      message,
      type: 'warning',
      context
    });
  }

  /**
   * Show info message
   */
  showInfo(message: string, context?: string): void {
    this.addError({
      message,
      type: 'info',
      context
    });
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  /**
   * Handle async operations with error handling
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context: string,
    successMessage?: string
  ): Promise<T | null> {
    this.setLoading(true);
    
    try {
      const result = await operation();
      
      if (successMessage) {
        this.showSuccess(successMessage, context);
      }
      
      return result;
    } catch (error) {
      this.handleApiError(error, context);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Enhanced API error handling with HTTP error response
   */
  handleHttpError(error: HttpErrorResponse, context: string): void {
    const errorCode = this.getErrorCode(error);
    const message = this.getHttpErrorMessage(error);
    const retryable = this.isRetryableHttpError(error);

    this.addError({
      message,
      type: this.getErrorSeverity(error),
      context,
      code: errorCode,
      retryable,
      action: retryable ? {
        label: 'Thử lại',
        handler: () => window.location.reload()
      } : undefined
    });
  }

  /**
   * Create retry logic for observables
   */
  createRetryLogic(config: Partial<RetryConfig> = {}): (source: Observable<any>) => Observable<any> {
    const defaultConfig: RetryConfig = {
      maxRetries: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      ...config
    };

    return retryWhen(errors =>
      errors.pipe(
        mergeMap((error, index) => {
          const retryAttempt = index + 1;

          if (retryAttempt > defaultConfig.maxRetries || !this.isRetryableHttpError(error)) {
            return throwError(() => error);
          }

          const delay = defaultConfig.delayMs * Math.pow(defaultConfig.backoffMultiplier, retryAttempt - 1);

          console.warn(`🔄 Retrying request (attempt ${retryAttempt}/${defaultConfig.maxRetries}) after ${delay}ms`);

          return timer(delay);
        })
      )
    );
  }

  /**
   * Handle async operations with enhanced error handling and retry
   */
  async handleAsyncWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    retryConfig?: Partial<RetryConfig>,
    successMessage?: string
  ): Promise<T | null> {
    this.setLoading(true);

    try {
      const result = await operation();

      if (successMessage) {
        this.showSuccess(successMessage, context);
      }

      return result;
    } catch (error) {
      // If it's an HTTP error, use enhanced handling
      if (error instanceof HttpErrorResponse) {
        this.handleHttpError(error, context);
      } else {
        this.handleApiError(error, context);
      }
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Omit<AppError, 'id' | 'timestamp'>): boolean {
    // Network errors are usually retryable
    if (error.context?.includes('network')) return true;

    // 5xx server errors are retryable
    if (error.code?.startsWith('5')) return true;

    // Timeout errors are retryable
    if (error.message?.toLowerCase().includes('timeout')) return true;

    return false;
  }

  /**
   * Check if HTTP error is retryable
   */
  private isRetryableHttpError(error: HttpErrorResponse): boolean {
    // Network errors
    if (error.status === 0) return true;

    // Server errors (5xx)
    if (error.status >= 500) return true;

    // Timeout
    if (error.status === 408) return true;

    // Too many requests (with retry-after header)
    if (error.status === 429) return true;

    return false;
  }

  /**
   * Get error code from HTTP response
   */
  private getErrorCode(error: HttpErrorResponse): string {
    if (error.error?.code) return error.error.code;
    if (error.error?.statusCode) return error.error.statusCode.toString();
    return error.status.toString();
  }

  /**
   * Get user-friendly error message from HTTP response
   */
  private getHttpErrorMessage(error: HttpErrorResponse): string {
    // Check for custom error message from backend
    if (error.error?.message) {
      return error.error.message;
    }

    // Check for field-specific errors
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const fieldErrors = error.error.errors.map((e: any) => e.message).join(', ');
      return fieldErrors;
    }

    // Default messages based on status code
    switch (error.status) {
      case 0:
        return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      case 400:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền truy cập vào tài nguyên này.';
      case 404:
        return 'Không tìm thấy dữ liệu yêu cầu.';
      case 408:
        return 'Yêu cầu đã timeout. Vui lòng thử lại.';
      case 429:
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      case 502:
      case 503:
      case 504:
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
      default:
        return `Đã xảy ra lỗi (${error.status}). Vui lòng thử lại.`;
    }
  }

  /**
   * Get error severity based on HTTP status
   */
  private getErrorSeverity(error: HttpErrorResponse): 'error' | 'warning' | 'info' {
    if (error.status >= 500) return 'error';
    if (error.status >= 400 && error.status < 500) return 'warning';
    return 'info';
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}