import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorHandlingService } from '../../shared/services/error-handling.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private errorService = inject(ErrorHandlingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  handleError(error: any): void {
    // Prevent Angular from logging the error again
    const originalConsoleError = console.error;
    console.error = () => {}; // Temporarily disable console.error

    try {
      this.processError(error);
    } finally {
      console.error = originalConsoleError; // Restore console.error
    }
  }

  private processError(error: any): void {
    // Extract error information
    const errorInfo = this.extractErrorInfo(error);

    // Log error for debugging (in development)
    if (!this.isProduction()) {
      console.group('🚨 Global Error Handler');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Handle different types of errors
    this.ngZone.run(() => {
      if (this.isAuthenticationError(error)) {
        this.handleAuthenticationError();
      } else if (this.isNetworkError(error)) {
        this.handleNetworkError(errorInfo);
      } else if (this.isChunkLoadError(error)) {
        this.handleChunkLoadError();
      } else {
        this.handleGenericError(errorInfo);
      }
    });

    // Send error to monitoring service (if available)
    this.reportErrorToMonitoring(errorInfo);
  }

  private extractErrorInfo(error: any): ErrorInfo {
    let message = 'Đã xảy ra lỗi không mong muốn';
    let stack = '';
    let name = 'Unknown Error';
    let url = '';
    let userAgent = '';

    if (typeof window !== 'undefined') {
      url = window.location.href;
      userAgent = window.navigator.userAgent;
    }

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack || '';
      name = error.name;
    } else if (error?.rejection instanceof Error) {
      // Promise rejection
      message = error.rejection.message;
      stack = error.rejection.stack || '';
      name = error.rejection.name;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
      stack = error.stack || '';
      name = error.name || 'Error';
    }

    return {
      message,
      stack,
      name,
      url,
      userAgent,
      timestamp: new Date(),
      userId: this.authService.currentUser()?.id,
      userRole: this.authService.userRole(),
      isAuthenticated: this.authService.isAuthenticated()
    };
  }

  private isAuthenticationError(error: any): boolean {
    return error?.status === 401 ||
           error?.status === 403 ||
           error?.message?.includes('authentication') ||
           error?.message?.includes('unauthorized');
  }

  private isNetworkError(error: any): boolean {
    return error?.status === 0 ||
           error?.status >= 500 ||
           error?.message?.includes('network') ||
           error?.message?.includes('connection');
  }

  private isChunkLoadError(error: any): boolean {
    return error?.message?.includes('Loading chunk') ||
           error?.message?.includes('ChunkLoadError') ||
           error?.name === 'ChunkLoadError';
  }

  private handleAuthenticationError(): void {
    // Clear authentication state
    this.authService.logout();

    // Show user-friendly message
    this.errorService.addError({
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      type: 'warning',
      context: 'authentication',
      action: {
        label: 'Đăng nhập',
        handler: () => this.router.navigate(['/auth/login'])
      }
    });
  }

  private handleNetworkError(errorInfo: ErrorInfo): void {
    this.errorService.addError({
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
      type: 'error',
      context: 'network',
      action: {
        label: 'Thử lại',
        handler: () => window.location.reload()
      }
    });
  }

  private handleChunkLoadError(): void {
    this.errorService.addError({
      message: 'Ứng dụng đã được cập nhật. Đang tải lại trang...',
      type: 'info',
      context: 'chunk-load'
    });

    // Auto-reload after showing message
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  private handleGenericError(errorInfo: ErrorInfo): void {
    // Only show error to user in development or for critical errors
    if (!this.isProduction() || this.isCriticalError(errorInfo)) {
      this.errorService.addError({
        message: 'Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi tiếp tục xảy ra.',
        type: 'error',
        context: 'application',
        action: {
          label: 'Báo cáo lỗi',
          handler: () => this.reportErrorToSupport(errorInfo)
        }
      });
    }
  }

  private isCriticalError(errorInfo: ErrorInfo): boolean {
    // Consider errors critical if they affect core functionality
    const criticalPatterns = [
      'cannot read property',
      'cannot set property',
      'undefined is not a function',
      'null reference',
      'type error'
    ];

    const message = errorInfo.message.toLowerCase();
    return criticalPatterns.some(pattern => message.includes(pattern));
  }

  private reportErrorToMonitoring(errorInfo: ErrorInfo): void {
    // In a real application, send to monitoring service like Sentry, LogRocket, etc.
    // For now, just store in localStorage for debugging
    if (!this.isProduction()) {
      try {
        const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        existingErrors.push(errorInfo);

        // Keep only last 10 errors
        if (existingErrors.length > 10) {
          existingErrors.splice(0, existingErrors.length - 10);
        }

        localStorage.setItem('app_errors', JSON.stringify(existingErrors));
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    // TODO: Integrate with monitoring service
    // this.monitoringService.captureException(error, { extra: errorInfo });
  }

  private reportErrorToSupport(errorInfo: ErrorInfo): void {
    // Create a mailto link with error details
    const subject = encodeURIComponent('LMS Maritime - Báo cáo lỗi');
    const body = encodeURIComponent(`
Thông tin lỗi:
- Thời gian: ${errorInfo.timestamp.toISOString()}
- URL: ${errorInfo.url}
- Trình duyệt: ${errorInfo.userAgent}
- Người dùng: ${errorInfo.userId || 'Chưa đăng nhập'}
- Vai trò: ${errorInfo.userRole || 'N/A'}

Chi tiết lỗi:
${errorInfo.name}: ${errorInfo.message}

Stack trace:
${errorInfo.stack}
    `.trim());

    const mailtoLink = `mailto:support@lms-maritime.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  }

  private isProduction(): boolean {
    return typeof window !== 'undefined' &&
           window.location.hostname !== 'localhost' &&
           !window.location.hostname.includes('127.0.0.1');
  }
}

interface ErrorInfo {
  message: string;
  stack: string;
  name: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  userRole?: string | null;
  isAuthenticated: boolean;
}