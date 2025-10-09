import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
import { environment } from '../../../../../environments/environment';

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  payment: {
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalClientSecret: string;
    currency: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private errorService = inject(ErrorHandlingService);

  // API Configuration
  private readonly API_BASE_URL = `${environment.apiUrl}/api/v1`;
  private readonly ENDPOINTS = {
    settings: '/settings'
  };

  // Signals for reactive state management
  private _settings = signal<SystemSettings | null>(null);
  private _isLoading = signal<boolean>(false);

  // Readonly signals for external consumption
  readonly settings = this._settings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Settings Management Methods
  async getSettings(): Promise<SystemSettings> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
      await this.simulateApiCall();

      const settings: SystemSettings = {
        general: {
          siteName: 'LMS Maritime',
          siteDescription: 'Hệ thống quản lý học tập chuyên về lĩnh vực hàng hải',
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'admin@lms-maritime.com',
          smtpPassword: '********',
          fromEmail: 'noreply@lms-maritime.com',
          fromName: 'LMS Maritime'
        },
        payment: {
          stripePublicKey: 'pk_test_...',
          stripeSecretKey: 'sk_test_...',
          paypalClientId: 'client_id_...',
          paypalClientSecret: 'client_secret_...',
          currency: 'VND'
        },
        security: {
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireTwoFactor: false
        }
      };

      this._settings.set(settings);
      return settings;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
      await this.simulateApiCall();

      this._settings.update(current => ({
        ...current!,
        ...settings
      }));

      this.errorService.showSuccess('Cài đặt hệ thống đã được cập nhật thành công!', 'settings');
    } finally {
      this._isLoading.set(false);
    }
  }

  // General Settings Methods
  async updateGeneralSettings(generalSettings: Partial<SystemSettings['general']>): Promise<void> {
    const currentSettings = this._settings();
    if (currentSettings) {
      await this.updateSettings({
        general: { ...currentSettings.general, ...generalSettings }
      });
    }
  }

  async updateEmailSettings(emailSettings: Partial<SystemSettings['email']>): Promise<void> {
    const currentSettings = this._settings();
    if (currentSettings) {
      await this.updateSettings({
        email: { ...currentSettings.email, ...emailSettings }
      });
    }
  }

  async updatePaymentSettings(paymentSettings: Partial<SystemSettings['payment']>): Promise<void> {
    const currentSettings = this._settings();
    if (currentSettings) {
      await this.updateSettings({
        payment: { ...currentSettings.payment, ...paymentSettings }
      });
    }
  }

  async updateSecuritySettings(securitySettings: Partial<SystemSettings['security']>): Promise<void> {
    const currentSettings = this._settings();
    if (currentSettings) {
      await this.updateSettings({
        security: { ...currentSettings.security, ...securitySettings }
      });
    }
  }

  // Validation Methods
  validateEmailSettings(emailSettings: Partial<SystemSettings['email']>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (emailSettings.smtpHost && !emailSettings.smtpHost.trim()) {
      errors.push('SMTP Host không được để trống');
    }

    if (emailSettings.smtpPort && (emailSettings.smtpPort < 1 || emailSettings.smtpPort > 65535)) {
      errors.push('SMTP Port phải nằm trong khoảng 1-65535');
    }

    if (emailSettings.fromEmail && !this.isValidEmail(emailSettings.fromEmail)) {
      errors.push('From Email không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validatePaymentSettings(paymentSettings: Partial<SystemSettings['payment']>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (paymentSettings.currency && !['VND', 'USD', 'EUR'].includes(paymentSettings.currency)) {
      errors.push('Đơn vị tiền tệ phải là VND, USD hoặc EUR');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateSecuritySettings(securitySettings: Partial<SystemSettings['security']>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (securitySettings.sessionTimeout && securitySettings.sessionTimeout < 1) {
      errors.push('Thời gian hết hạn phiên phải lớn hơn 0');
    }

    if (securitySettings.maxLoginAttempts && securitySettings.maxLoginAttempts < 1) {
      errors.push('Số lần đăng nhập tối đa phải lớn hơn 0');
    }

    if (securitySettings.passwordMinLength && securitySettings.passwordMinLength < 6) {
      errors.push('Độ dài mật khẩu tối thiểu phải ít nhất 6 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Test Methods
  async testEmailSettings(): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would send a test email
      await this.simulateApiCall();

      return {
        success: true,
        message: 'Email test thành công! Kiểm tra hộp thư của bạn.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Không thể gửi email test. Vui lòng kiểm tra cài đặt.'
      };
    }
  }

  async testPaymentSettings(): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would test payment gateway connection
      await this.simulateApiCall();

      return {
        success: true,
        message: 'Kết nối thanh toán thành công!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Không thể kết nối đến cổng thanh toán. Vui lòng kiểm tra cài đặt.'
      };
    }
  }

  // Backup & Restore Methods
  async createBackup(): Promise<{ success: boolean; backupId: string; downloadUrl: string }> {
    try {
      // In production, this would create a system backup
      await this.simulateApiCall();

      return {
        success: true,
        backupId: 'backup_' + Date.now(),
        downloadUrl: '/api/backups/download/backup_' + Date.now()
      };
    } catch (error) {
      throw new Error('Không thể tạo backup. Vui lòng thử lại.');
    }
  }

  async restoreFromBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would restore from backup
      await this.simulateApiCall();

      return {
        success: true,
        message: 'Khôi phục dữ liệu thành công!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Khôi phục dữ liệu thất bại. Vui lòng thử lại.'
      };
    }
  }

  async getBackupHistory(): Promise<{ id: string; createdAt: Date; size: string; status: 'completed' | 'failed' }[]> {
    try {
      // In production, this would fetch backup history
      await this.simulateApiCall();

      return [
        {
          id: 'backup_001',
          createdAt: new Date('2024-10-01'),
          size: '2.5 GB',
          status: 'completed'
        },
        {
          id: 'backup_002',
          createdAt: new Date('2024-09-25'),
          size: '2.3 GB',
          status: 'completed'
        }
      ];
    } catch (error) {
      return [];
    }
  }

  // Helper Methods
  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters for easy access
  get generalSettings() {
    return computed(() => this._settings()?.general);
  }

  get emailSettings() {
    return computed(() => this._settings()?.email);
  }

  get paymentSettings() {
    return computed(() => this._settings()?.payment);
  }

  get securitySettings() {
    return computed(() => this._settings()?.security);
  }
}