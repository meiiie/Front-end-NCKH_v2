import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, firstValueFrom } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
import { environment } from '../../../../../environments/environment';
import * as XLSX from 'xlsx';

// Define UserRole enum locally to avoid import issues
export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin: Date;
  loginCount: number;
  coursesCreated?: number;
  coursesEnrolled?: number;
  totalSpent?: number;
  permissions: string[];
}

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BulkImportProgress {
  isImporting: boolean;
  progress: number;
  currentStep: string;
  result?: BulkImportResult;
}

export interface BulkImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importedUsers: AdminUser[];
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: PaginationInfo | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private errorService = inject(ErrorHandlingService);

  // API Configuration
  private readonly API_BASE_URL = `${environment.apiUrl}/api/v1`;
  private readonly ENDPOINTS = {
    users: '/users',
    bulkImport: '/users/bulk-import',
    bulkImportTemplate: '/users/bulk-import/template'
  };

  // Signals for reactive state management
  private _users = signal<AdminUser[]>([]);
  private _isLoading = signal<boolean>(false);
  private _pagination = signal<PaginationInfo | null>(null);
  private _bulkImportProgress = signal<BulkImportProgress>({
    isImporting: false,
    progress: 0,
    currentStep: ''
  });

  // Readonly signals for external consumption
  readonly users = this._users.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly bulkImportProgress = this._bulkImportProgress.asReadonly();

  // Computed signals
  readonly totalUsers = computed(() => {
    const pagination = this._pagination();
    return pagination?.totalElements || this._users().length;
  });

  readonly totalTeachers = computed(() => {
    const pagination = this._pagination();
    if (pagination && pagination.totalElements > pagination.size) {
      const currentPageTeachers = this._users().filter(user => user.role === 'teacher').length;
      const ratio = currentPageTeachers / Math.max(this._users().length, 1);
      return Math.max(0, Math.round(pagination.totalElements * ratio));
    }
    return this._users().filter(user => user.role === 'teacher').length;
  });

  readonly totalStudents = computed(() => {
    const pagination = this._pagination();
    if (pagination && pagination.totalElements > pagination.size) {
      const currentPageStudents = this._users().filter(user => user.role === 'student').length;
      const ratio = currentPageStudents / Math.max(this._users().length, 1);
      return Math.max(0, Math.round(pagination.totalElements * ratio));
    }
    return this._users().filter(user => user.role === 'student').length;
  });

  readonly totalAdmins = computed(() => {
    const pagination = this._pagination();
    if (pagination && pagination.totalElements > pagination.size) {
      const currentPageAdmins = this._users().filter(user => user.role === 'admin').length;
      const ratio = currentPageAdmins / Math.max(this._users().length, 1);
      return Math.max(0, Math.round(pagination.totalElements * ratio));
    }
    return this._users().filter(user => user.role === 'admin').length;
  });

  readonly activeUsers = computed(() => {
    const pagination = this._pagination();
    if (pagination && pagination.totalElements > pagination.size) {
      const currentPageActive = this._users().filter(user => user.isActive).length;
      const ratio = currentPageActive / Math.max(this._users().length, 1);
      return Math.max(0, Math.round(pagination.totalElements * ratio));
    }
    return this._users().filter(user => user.isActive).length;
  });

  // User Management Methods
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<UsersResponse> {
    this._isLoading.set(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await firstValueFrom(this.http.get<any>(`${this.API_BASE_URL}${this.ENDPOINTS.users}?${params}`));

      if (response?.success && response?.data) {
        if (Array.isArray(response.data)) {
          const users: AdminUser[] = response.data.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.fullName || user.username,
            role: user.role.toLowerCase() as UserRole,
            avatar: this.getDefaultAvatar(user.email),
            department: this.getDepartmentFromRole(user.role.toLowerCase()),
            studentId: user.role === 'STUDENT' ? this.generateStudentId() : undefined,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt || user.createdAt),
            isActive: user.enabled,
            lastLogin: new Date(),
            loginCount: 0,
            permissions: this.getDefaultPermissions(user.role.toLowerCase() as UserRole)
          }));

          let pagination: PaginationInfo;
          if (response.pagination) {
            pagination = {
              totalElements: response.pagination.totalItems,
              totalPages: response.pagination.totalPages,
              size: response.pagination.limit,
              number: response.pagination.page - 1,
              first: response.pagination.page === 1,
              last: response.pagination.page === response.pagination.totalPages
            };
          } else {
            pagination = {
              totalElements: users.length,
              totalPages: 1,
              size: users.length,
              number: 0,
              first: true,
              last: true
            };
          }

          this._users.set(users);
          this._pagination.set(pagination);

          return { users, pagination };
        } else {
          throw new Error('Invalid API response format: expected array in data field');
        }
      } else {
        throw new Error('Invalid API response format: missing data');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.errorService.addError({
        message: 'Không thể tải danh sách người dùng. Vui lòng thử lại.',
        type: 'error',
        context: 'user'
      });
      this._users.set([]);
      this._pagination.set(null);
      return { users: [], pagination: null };
    } finally {
      this._isLoading.set(false);
    }
  }

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    this._isLoading.set(true);
    try {
      this.validateUserData(userData);

      const backendUserData = {
        username: userData.name?.toLowerCase().replace(/\s+/g, '') || '',
        email: userData.email || '',
        password: '123456',
        fullName: userData.name || '',
        role: userData.role?.toUpperCase() || 'STUDENT'
      };

      const response = await firstValueFrom(this.http.post<any>(`${this.API_BASE_URL}${this.ENDPOINTS.users}`, backendUserData));

      if (response && response.data) {
        const newUser: AdminUser = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.fullName,
          role: response.data.role.toLowerCase(),
          avatar: this.getDefaultAvatar(response.data.email),
          department: this.getDepartmentFromRole(response.data.role.toLowerCase()),
          studentId: response.data.role === 'STUDENT' ? this.generateStudentId() : undefined,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          isActive: response.data.enabled,
          lastLogin: new Date(),
          loginCount: 0,
          permissions: this.getDefaultPermissions(response.data.role.toLowerCase())
        };

        this._users.update(users => [...users, newUser]);
        this.errorService.showSuccess('Người dùng đã được tạo thành công!', 'user');
        return newUser;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      this.errorService.addError({
        message: 'Tạo người dùng thất bại. Vui lòng thử lại.',
        type: 'error',
        context: 'user'
      });
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    this._isLoading.set(true);
    try {
      const backendUpdates = {
        email: updates.email,
        fullName: updates.name,
        role: updates.role?.toUpperCase(),
        enabled: updates.isActive
      };

      const response = await firstValueFrom(this.http.put<any>(`${this.API_BASE_URL}${this.ENDPOINTS.users}/${userId}`, backendUpdates));

      if (response && response.data) {
        const updatedUser: AdminUser = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.fullName,
          role: response.data.role.toLowerCase(),
          avatar: this.getDefaultAvatar(response.data.email),
          department: this.getDepartmentFromRole(response.data.role.toLowerCase()),
          studentId: response.data.role === 'STUDENT' ? this.generateStudentId() : undefined,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          isActive: response.data.enabled,
          lastLogin: new Date(),
          loginCount: 0,
          permissions: this.getDefaultPermissions(response.data.role.toLowerCase())
        };

        this._users.update(users =>
          users.map(user => user.id === userId ? updatedUser : user)
        );

        this.errorService.showSuccess('Người dùng đã được cập nhật thành công!', 'user');
        return updatedUser;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      this.errorService.addError({
        message: 'Cập nhật người dùng thất bại. Vui lòng thử lại.',
        type: 'error',
        context: 'user'
      });
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      await firstValueFrom(this.http.delete(`${this.API_BASE_URL}${this.ENDPOINTS.users}/${userId}`));

      this._users.update(users => users.filter(user => user.id !== userId));
      this.errorService.showSuccess('Người dùng đã được xóa thành công!', 'user');
    } catch (error) {
      console.error('Failed to delete user:', error);
      this.errorService.addError({
        message: 'Xóa người dùng thất bại. Vui lòng thử lại.',
        type: 'error',
        context: 'user'
      });
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async toggleUserStatus(userId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const currentUser = this._users().find(u => u.id === userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const newStatus = !currentUser.isActive;

      const response = await firstValueFrom(this.http.put<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.users}/${userId}`,
        { enabled: newStatus }
      ));

      if (response && response.data) {
        this._users.update(users =>
          users.map(user =>
            user.id === userId
              ? { ...user, isActive: newStatus, updatedAt: new Date() }
              : user
          )
        );

        this.errorService.showSuccess(
          `Người dùng đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} thành công!`,
          'user'
        );
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      this.errorService.addError({
        message: 'Cập nhật trạng thái người dùng thất bại. Vui lòng thử lại.',
        type: 'error',
        context: 'user'
      });
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  // Bulk Import Methods
  async bulkImportUsers(file: File, defaultRole: UserRole = UserRole.STUDENT): Promise<BulkImportResult> {
    this._bulkImportProgress.set({
      isImporting: true,
      progress: 0,
      currentStep: 'Đang chuẩn bị file...'
    });

    try {
      this.validateImportFile(file);

      this._bulkImportProgress.update(p => ({ ...p, progress: 20, currentStep: 'Đang upload file...' }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('defaultRole', defaultRole.toUpperCase());

      this._bulkImportProgress.update(p => ({ ...p, progress: 40, currentStep: 'Đang xử lý dữ liệu...' }));

      const response = await firstValueFrom(this.http.post<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.bulkImport}`,
        formData,
        { headers: this.getAuthHeaders() }
      ));

      this._bulkImportProgress.update(p => ({ ...p, progress: 80, currentStep: 'Đang hoàn tất...' }));

      if (response?.success && response?.data) {
        const result: BulkImportResult = {
          totalRows: response.data.totalRows,
          successfulImports: response.data.successfulImports,
          failedImports: response.data.failedImports,
          errors: response.data.errors || [],
          importedUsers: response.data.importedUsers?.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role.toLowerCase() as UserRole,
            avatar: this.getDefaultAvatar(user.email),
            department: '',
            createdAt: new Date(user.createdAt),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(user.createdAt),
            isActive: user.enabled,
            lastLogin: new Date(),
            loginCount: 0,
            permissions: this.getDefaultPermissions(user.role.toLowerCase() as UserRole)
          })) || []
        };

        this._users.update(users => [...users, ...result.importedUsers]);

        this._bulkImportProgress.set({
          isImporting: false,
          progress: 100,
          currentStep: 'Hoàn thành',
          result
        });

        this.errorService.showSuccess(
          `Import hoàn thành! ${result.successfulImports}/${result.totalRows} người dùng đã được thêm thành công.`,
          'bulk-import'
        );

        return result;
      } else {
        throw new Error(response?.message || 'Invalid API response format');
      }
    } catch (error: any) {
      console.error('Bulk import failed:', error);

      this._bulkImportProgress.set({
        isImporting: false,
        progress: 0,
        currentStep: 'Lỗi khi import'
      });

      const errorMessage = error?.error?.message || error?.message || 'Import thất bại. Vui lòng thử lại.';
      this.errorService.addError({
        message: errorMessage,
        type: 'error',
        context: 'bulk-import'
      });

      throw error;
    }
  }

  resetBulkImportProgress(): void {
    this._bulkImportProgress.set({
      isImporting: false,
      progress: 0,
      currentStep: ''
    });
  }

  // Helper Methods
  private getAuthHeaders(): { [header: string]: string } {
    const token = this.authService.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private validateUserData(userData: Partial<AdminUser>): void {
    const requiredFields = ['email', 'name', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field as keyof AdminUser]);

    if (missingFields.length > 0) {
      throw new Error(`Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`);
    }
  }

  private getDefaultAvatar(email: string): string {
    const name = email.split('@')[0];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=ffffff&size=150`;
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

  private generateStudentId(): string {
    return 'SV' + new Date().getFullYear() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  private getDefaultPermissions(role: UserRole): string[] {
    switch (role) {
      case 'admin':
        return ['read', 'write', 'delete', 'manage_users', 'manage_courses', 'manage_system'];
      case 'teacher':
        return ['read', 'write', 'manage_courses', 'manage_students'];
      case 'student':
        return ['read', 'enroll_courses'];
      default:
        return ['read'];
    }
  }

  private validateImportFile(file: File): void {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Kích thước file không được vượt quá 10MB');
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      throw new Error('Tên file phải có đuôi .xlsx hoặc .xls');
    }
  }

  downloadExcelTemplate(): void {
    try {
      // Create sample data for template
      const templateData = [
        {
          'Username': 'nguyenvana',
          'Email': 'nguyenvana@student.edu.vn',
          'Full Name': 'Nguyễn Văn A',
          'Department': 'Khoa Hàng hải'
        },
        {
          'Username': 'tranthib',
          'Email': 'tranthib@student.edu.vn',
          'Full Name': 'Trần Thị B',
          'Department': 'Khoa Hàng hải'
        }
      ];

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `user_import_template_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      this.errorService.showSuccess('Template đã được tải xuống thành công!', 'template');
    } catch (error) {
      console.error('Failed to download template:', error);
      this.errorService.addError({
        message: 'Không thể tải template. Vui lòng thử lại.',
        type: 'error',
        context: 'template'
      });
    }
  }
}