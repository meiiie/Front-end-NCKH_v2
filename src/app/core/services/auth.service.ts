import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole, LoginRequest, RegisterRequest } from '../../shared/types/user.types';
import { ErrorHandlingService } from '../../shared/services/error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private errorService = inject(ErrorHandlingService);
  
  // Core signal: Single source of truth for user state
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Session management
  private sessionTimer?: number;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Readonly signals for external consumption
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals: Derived state that automatically updates
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.role || null);
  readonly userName = computed(() => this._currentUser()?.name || '');
  readonly userEmail = computed(() => this._currentUser()?.email || '');

  constructor() {
    // Auto-hydrate state from localStorage on service initialization
    this.initializeFromStorage();
    
    // Auto-sync state to localStorage when user changes
    effect(() => {
      const user = this._currentUser();
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          localStorage.setItem('lms_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('lms_user');
        }
      }
    });
  }

  private initializeFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('lms_user');
      const loginTime = localStorage.getItem('lms_login_time');
      
      if (storedUser && loginTime) {
        try {
          const user = JSON.parse(storedUser);
          const loginTimestamp = parseInt(loginTime);
          const now = Date.now();
          
          // Check if session has expired
          if (now - loginTimestamp < this.SESSION_DURATION) {
            this._currentUser.set(user);
            this.startSessionTimer();
          } else {
            // Session expired, clear storage
            localStorage.removeItem('lms_user');
            localStorage.removeItem('lms_login_time');
            this.errorService.showWarning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'session');
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('lms_user');
          localStorage.removeItem('lms_login_time');
          this.errorService.addError({
            message: 'Lỗi khi khôi phục phiên đăng nhập. Vui lòng đăng nhập lại.',
            type: 'error',
            context: 'session'
          });
        }
      }
    }
  }

  async login(credentials: LoginRequest): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.simulateApiCall();
      
      // Mock user data based on email pattern
      const mockUser: User = {
        id: this.generateUserId(),
        email: credentials.email,
        name: this.extractNameFromEmail(credentials.email),
        role: this.getRoleFromEmail(credentials.email),
        avatar: this.getDefaultAvatar(credentials.email),
        department: this.getDepartmentFromRole(this.getRoleFromEmail(credentials.email)),
        studentId: this.getRoleFromEmail(credentials.email) === 'student' ? this.generateStudentId() : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this._currentUser.set(mockUser);
      this.startSessionTimer();
      
      this.errorService.showSuccess(`Chào mừng trở lại, ${mockUser.name}!`, 'login');
      
      // Redirect after successful login
      this.redirectAfterLogin();
      
    } catch (error) {
      const errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      this._error.set(errorMessage);
      this.errorService.addError({
        message: errorMessage,
        type: 'error',
        context: 'login'
      });
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.simulateApiCall();
      
      const mockUser: User = {
        id: this.generateUserId(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: this.getDefaultAvatar(userData.email),
        department: userData.department || this.getDepartmentFromRole(userData.role),
        studentId: userData.role === 'student' ? userData.studentId : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this._currentUser.set(mockUser);
      this.startSessionTimer();
      
      this.errorService.showSuccess(`Đăng ký thành công! Chào mừng ${mockUser.name}!`, 'register');
      
    } catch (error) {
      const errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      this._error.set(errorMessage);
      this.errorService.addError({
        message: errorMessage,
        type: 'error',
        context: 'register'
      });
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  logout(): void {
    this.clearSessionTimer();
    this._currentUser.set(null);
    this._error.set(null);
    
    this.errorService.showSuccess('Đã đăng xuất thành công!', 'logout');
    
    // Redirect to login page
    this.router.navigate(['/auth/login']).catch(error => {
      this.errorService.handleNavigationError(error, '/auth/login');
    });
  }

  clearError(): void {
    this._error.set(null);
  }

  // Role checking methods
  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.userRole();
    return userRole ? roles.includes(userRole) : false;
  }

  // Compatibility method for components using user()
  user(): User | null {
    return this._currentUser();
  }

  // Helper methods
  private async simulateApiCall(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private getRoleFromEmail(email: string): UserRole {
    if (email.includes('admin')) return UserRole.ADMIN;
    if (email.includes('teacher')) return UserRole.TEACHER;
    if (email.includes('student')) return UserRole.STUDENT;
    return UserRole.STUDENT; // Default role
  }

  private extractNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private getDefaultAvatar(email: string): string {
    // Generate avatar based on email
    const name = this.extractNameFromEmail(email);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=150`;
  }

  private getDepartmentFromRole(role: UserRole): string {
    switch (role) {
      case 'student':
        return 'Khoa Hàng hải';
      case 'teacher':
        return 'Khoa Hàng hải';
      case 'admin':
        return 'Phòng Quản trị';
      default:
        return 'Khoa Hàng hải';
    }
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  private generateStudentId(): string {
    return 'SV' + new Date().getFullYear() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  private redirectAfterLogin(): void {
    const role = this.userRole();
    if (role) {
      this.router.navigate([`/${role}/dashboard`]).catch(error => {
        this.errorService.handleNavigationError(error, `/${role}/dashboard`);
      });
    } else {
      this.router.navigate(['/']).catch(error => {
        this.errorService.handleNavigationError(error, '/');
      });
    }
  }

  // Demo login methods for testing
  async loginAsDemo(role: UserRole): Promise<void> {
    const demoCredentials: LoginRequest = {
      email: `${role}@demo.com`,
      password: '123456'
    };
    await this.login(demoCredentials);
    // redirectAfterLogin() is already called in login() method
  }

  // Session management methods
  private startSessionTimer(): void {
    this.clearSessionTimer();
    
    // Store login time
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('lms_login_time', Date.now().toString());
    }
    
    // Set auto-logout timer
    this.sessionTimer = window.setTimeout(() => {
      this.autoLogout();
    }, this.SESSION_DURATION);
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = undefined;
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('lms_login_time');
    }
  }

  private autoLogout(): void {
    this.errorService.addError({
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      type: 'warning',
      context: 'session',
      action: {
        label: 'Đăng nhập',
        handler: () => this.router.navigate(['/auth/login'])
      }
    });
    this.logout();
  }
}