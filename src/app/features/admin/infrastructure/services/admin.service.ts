import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
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

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  price: number;
  thumbnail: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'archived';
  instructor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  students: number;
  rating: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  certificate: {
    type: 'STCW' | 'IMO' | 'Professional' | 'Completion';
    description: string;
  };
}

export interface AdminAnalytics {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  pendingCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeUsers: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
    email: 'healthy' | 'warning' | 'error';
  };
  userGrowth: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  courseStats: {
    pending: number;
    approved: number;
    rejected: number;
    active: number;
  };
  revenueStats: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  // Additional properties for admin dashboard
  studentGrowth: number;
  courseGrowth: number;
  revenue: number;
  revenueGrowth: number;
  systemUptime: number;
  onlineStudents: number;
  activeCourses: number;
  pendingAssignments: number;
  unreadMessages: number;
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

export interface ExcelPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  validationErrors: string[];
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: PaginationInfo | null;
}

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

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BulkImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importedUsers: AdminUser[];
}

export interface BulkImportProgress {
  isImporting: boolean;
  progress: number;
  currentStep: string;
  result?: BulkImportResult;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: PaginationInfo | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private errorService = inject(ErrorHandlingService);

  // API Configuration - Use local backend
  private readonly API_BASE_URL = 'http://localhost:8090/api/v1';
  private readonly ENDPOINTS = {
    users: '/users',
    bulkImport: '/users/bulk-import',
    bulkImportTemplate: '/users/bulk-import/template',
    courses: '/courses',
    analytics: '/analytics',
    settings: '/settings',
    system: '/system'
  };

  // Signals for reactive state management
  private _users = signal<AdminUser[]>([]);
  private _courses = signal<AdminCourse[]>([]);
  private _analytics = signal<AdminAnalytics | null>(null);
  private _settings = signal<SystemSettings | null>(null);
  private _isLoading = signal<boolean>(false);
  private _pagination = signal<PaginationInfo | null>(null);
  private _bulkImportProgress = signal<BulkImportProgress>({
    isImporting: false,
    progress: 0,
    currentStep: ''
  });

  // Readonly signals for external consumption
  readonly users = this._users.asReadonly();
  readonly courses = this._courses.asReadonly();
  readonly analytics = this._analytics.asReadonly();
  readonly settings = this._settings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly bulkImportProgress = this._bulkImportProgress.asReadonly();

  // Computed signals - TEMPORARY SOLUTION: Use pagination totals where possible
  // TODO: Replace with dedicated stats API endpoint (see BACKEND_STATS_API_REQUIREMENT.md)
  readonly totalUsers = computed(() => {
    // Always use pagination total for accurate count
    const pagination = this._pagination();
    return pagination?.totalElements || this._users().length;
  });

  readonly totalTeachers = computed(() => {
    // TEMPORARY: Estimate based on current page distribution
    // This is inaccurate but better than showing wrong numbers
    // NEEDS PROPER STATS API FROM BACKEND
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
    // TEMPORARY: Estimate active users - NEEDS PROPER STATS API
    const pagination = this._pagination();
    if (pagination && pagination.totalElements > pagination.size) {
      const currentPageActive = this._users().filter(user => user.isActive).length;
      const ratio = currentPageActive / Math.max(this._users().length, 1);
      return Math.max(0, Math.round(pagination.totalElements * ratio));
    }
    return this._users().filter(user => user.isActive).length;
  });

  readonly pendingCourses = computed(() => 
    this._courses().filter(course => course.status === 'pending').length
  );

  readonly approvedCourses = computed(() => 
    this._courses().filter(course => course.status === 'approved').length
  );

  readonly totalRevenue = computed(() => 
    this._courses().reduce((sum, course) => sum + course.revenue, 0)
  );

  constructor() {
    // Removed loadMockData to prevent showing mock data
  }

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

      const response = await this.http.get<any>(`${this.API_BASE_URL}${this.ENDPOINTS.users}?${params}`).toPromise();

      if (response?.success && response?.data) {
        // According to new API docs, data is always an array
        if (Array.isArray(response.data)) {
          // Map backend users to frontend format
          const users: AdminUser[] = response.data.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.fullName || user.username, // Handle both fullName and username
            role: user.role.toLowerCase() as UserRole,
            avatar: this.getDefaultAvatar(user.email),
            department: this.getDepartmentFromRole(user.role.toLowerCase()),
            studentId: user.role === 'STUDENT' ? this.generateStudentId() : undefined,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt || user.createdAt),
            isActive: user.enabled,
            lastLogin: new Date(), // Backend doesn't provide last login yet
            loginCount: 0, // Backend doesn't provide login count yet
            permissions: this.getDefaultPermissions(user.role.toLowerCase() as UserRole)
          }));

          // Handle pagination info from response.pagination
          let pagination: PaginationInfo;
          if (response.pagination) {
            // New API format with separate pagination object
            pagination = {
              totalElements: response.pagination.totalItems,
              totalPages: response.pagination.totalPages,
              size: response.pagination.limit,
              number: response.pagination.page - 1, // Backend uses 1-based, convert to 0-based
              first: response.pagination.page === 1,
              last: response.pagination.page === response.pagination.totalPages
            };
          } else {
            // Fallback for non-paginated responses
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

  // Removed fetchUsersFromAPI method as it's now handled in getUsers method

  private getMockUsersFallback(page: number = 1, size: number = 10, search?: string): {users: AdminUser[], pagination: PaginationInfo} {
    const allUsers = this.getMockUsers();
    const filteredUsers = search
      ? allUsers.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          (user.studentId && user.studentId.toLowerCase().includes(search.toLowerCase()))
        )
      : allUsers;

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const pagination: PaginationInfo = {
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / size),
      size,
      number: page - 1,
      first: page === 1,
      last: page === Math.ceil(filteredUsers.length / size)
    };

    return { users: paginatedUsers, pagination };
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = this.authService.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    this._isLoading.set(true);
    try {
      this.validateUserData(userData);

      // Map frontend user data to backend format
      const backendUserData = {
        username: userData.name?.toLowerCase().replace(/\s+/g, '') || '',
        email: userData.email || '',
        password: '123456', // Default password, should be changed by user
        fullName: userData.name || '',
        role: userData.role?.toUpperCase() || 'STUDENT'
      };

      const response = await this.http.post<any>(`${this.API_BASE_URL}${this.ENDPOINTS.users}`, backendUserData).toPromise();

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
      // Map frontend updates to backend format
      const backendUpdates = {
        email: updates.email,
        fullName: updates.name,
        role: updates.role?.toUpperCase(),
        enabled: updates.isActive
      };

      const response = await this.http.put<any>(`${this.API_BASE_URL}${this.ENDPOINTS.users}/${userId}`, backendUpdates).toPromise();

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
      await this.http.delete(`${this.API_BASE_URL}${this.ENDPOINTS.users}/${userId}`).toPromise();

      // Remove from local state
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
      // Get current user status
      const currentUser = this._users().find(u => u.id === userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const newStatus = !currentUser.isActive;

      // Update via API
      const response = await this.http.put<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.users}/${userId}`,
        { enabled: newStatus }
      ).toPromise();

      if (response && response.data) {
        // Update local state
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
      // Validate file
      this.validateImportFile(file);

      this._bulkImportProgress.update(p => ({ ...p, progress: 20, currentStep: 'Đang upload file...' }));

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('defaultRole', defaultRole.toUpperCase());

      this._bulkImportProgress.update(p => ({ ...p, progress: 40, currentStep: 'Đang xử lý dữ liệu...' }));

      // Call backend API
      const response = await this.http.post<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.bulkImport}`,
        formData,
        { headers: this.getAuthHeaders() }
      ).toPromise();

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
            department: '', // Backend doesn't provide department yet
            createdAt: new Date(user.createdAt),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(user.createdAt),
            isActive: user.enabled,
            lastLogin: new Date(),
            loginCount: 0,
            permissions: this.getDefaultPermissions(user.role.toLowerCase() as UserRole)
          })) || []
        };

        // Add imported users to local state
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

  async getImportTemplate(): Promise<string> {
    try {
      const response = await this.http.get<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.bulkImportTemplate}`,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      if (response?.success && response?.data) {
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to get import template');
      }
    } catch (error: any) {
      console.error('Failed to get import template, using fallback:', error);
      // Fallback template if API fails
      return "Template Excel đơn giản chỉ cần 4 cột theo thứ tự:\n" +
             "1. Username (bắt buộc) - Tên đăng nhập\n" +
             "2. Email (bắt buộc) - Địa chỉ email\n" +
             "3. Full Name (bắt buộc) - Họ tên đầy đủ\n" +
             "4. Department (tùy chọn) - Phòng ban/Khoa\n\n" +
             "Ví dụ:\n" +
             "nguyenvana, nguyenvana@student.edu.vn, Nguyễn Văn A, Khoa CNTT\n" +
             "tranthib, tranthib@student.edu.vn, Trần Thị B, Khoa CNTT\n\n" +
             "Lưu ý: Tất cả người dùng sẽ được gán vai trò đã chọn trong form import.";
    }
  }

  resetBulkImportProgress(): void {
    this._bulkImportProgress.set({
      isImporting: false,
      progress: 0,
      currentStep: ''
    });
  }

  // Excel Import Preview
  async previewExcelImport(file: File): Promise<ExcelPreviewData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Get first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to array of arrays
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          }) as string[][];

          if (jsonData.length === 0) {
            throw new Error('File Excel trống hoặc không có dữ liệu');
          }

          // Extract headers and data rows
          const headers = jsonData[0] || [];
          const dataRows = jsonData.slice(1);

          // Validate headers
          const expectedHeaders = ['Username', 'Email', 'Full Name', 'Department'];
          const normalizedHeaders = headers.map(h => h.toString().trim().toLowerCase());
          const expectedNormalized = expectedHeaders.map(h => h.toLowerCase());

          const headersValid = expectedNormalized.every(expected =>
            normalizedHeaders.some(actual => actual.includes(expected.split(' ')[0]))
          );

          if (!headersValid) {
            throw new Error('Headers không đúng định dạng. Cần có: Username, Email, Full Name, Department');
          }

          // Validate data rows
          const validationErrors: string[] = [];
          let validRows = 0;
          let invalidRows = 0;

          dataRows.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because Excel rows start at 1 and we skip header
            let isValid = true;

            // Check required fields
            if (!row[0] || !row[0].toString().trim()) {
              validationErrors.push(`Dòng ${rowNumber}: Thiếu Username`);
              isValid = false;
            }
            if (!row[1] || !row[1].toString().trim()) {
              validationErrors.push(`Dòng ${rowNumber}: Thiếu Email`);
              isValid = false;
            }
            if (!row[2] || !row[2].toString().trim()) {
              validationErrors.push(`Dòng ${rowNumber}: Thiếu Full Name`);
              isValid = false;
            }

            // Validate email format if present
            if (row[1] && row[1].toString().trim()) {
              const email = row[1].toString().trim();
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) {
                validationErrors.push(`Dòng ${rowNumber}: Email không hợp lệ: ${email}`);
                isValid = false;
              }
            }

            // Validate username format if present
            if (row[0] && row[0].toString().trim()) {
              const username = row[0].toString().trim();
              const usernameRegex = /^[a-zA-Z0-9_-]+$/;
              if (!usernameRegex.test(username)) {
                validationErrors.push(`Dòng ${rowNumber}: Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang: ${username}`);
                isValid = false;
              }
            }

            if (isValid) {
              validRows++;
            } else {
              invalidRows++;
            }
          });

          const previewData: ExcelPreviewData = {
            headers: headers.map(h => h.toString()),
            rows: dataRows.slice(0, 10), // Show first 10 rows for preview
            totalRows: dataRows.length,
            validRows,
            invalidRows,
            validationErrors: validationErrors.slice(0, 20) // Show first 20 errors
          };

          resolve(previewData);

        } catch (error: any) {
          reject(new Error(`Lỗi khi đọc file Excel: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Lỗi khi đọc file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Excel Template Download
  downloadExcelTemplate(): void {
    // Create sample data for the template
    const sampleData = [
      ['nguyenvana', 'nguyenvana@student.edu.vn', 'Nguyễn Văn A', 'Khoa CNTT'],
      ['tranthib', 'tranthib@student.edu.vn', 'Trần Thị B', 'Khoa Toán'],
      ['levanc', 'levanc@teacher.edu.vn', 'Lê Văn C', 'Khoa Lý'],
      ['phamthid', 'phamthid@student.edu.vn', 'Phạm Thị D', 'Khoa Hóa']
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Username', 'Email', 'Full Name', 'Department'], // Headers
      ...sampleData // Sample data
    ]);

    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // Username
      { width: 25 }, // Email
      { width: 20 }, // Full Name
      { width: 15 }  // Department
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'User Import Template');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `user_import_template_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    this.errorService.showSuccess('Template Excel đã được tải xuống!', 'template');
  }

  // File Upload Methods for Vercel Blob
  async generateUploadUrl(fileName: string, fileSize: number, type: string = 'document'): Promise<{uploadUrl: string, fileUrl: string}> {
    try {
      const request = {
        fileName,
        fileSize,
        type
      };

      const response = await this.http.post<any>(
        `${this.API_BASE_URL}/files/generate-upload-url`,
        request,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      if (response?.success && response?.data) {
        return {
          uploadUrl: response.data.uploadUrl,
          fileUrl: response.data.fileUrl
        };
      } else {
        throw new Error(response?.message || 'Failed to generate upload URL');
      }
    } catch (error: any) {
      console.error('Failed to generate upload URL:', error);
      throw error;
    }
  }

  async uploadFileToBlob(uploadUrl: string, file: File): Promise<void> {
    try {
      await this.http.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      }).toPromise();
    } catch (error: any) {
      console.error('Failed to upload file to blob:', error);
      throw error;
    }
  }

  async validateFileUpload(fileUrl: string): Promise<void> {
    try {
      const request = { fileUrl };

      const response = await this.http.post<any>(
        `${this.API_BASE_URL}/files/validate-upload`,
        request,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      if (!response?.success) {
        throw new Error(response?.message || 'File validation failed');
      }
    } catch (error: any) {
      console.error('File validation failed:', error);
      throw error;
    }
  }

  async uploadFile(file: File, type: string = 'document'): Promise<{fileName: string, fileUrl: string, fileSize: number}> {
    try {
      // Generate signed upload URL
      const { uploadUrl, fileUrl } = await this.generateUploadUrl(file.name, file.size, type);

      // Upload file to Vercel Blob
      await this.uploadFileToBlob(uploadUrl, file);

      // Validate upload
      await this.validateFileUpload(fileUrl);

      return {
        fileName: file.name,
        fileUrl,
        fileSize: file.size
      };
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Course Management Methods
  async getCourses(): Promise<AdminCourse[]> {
    this._isLoading.set(true);
    try {
      await this.simulateApiCall();
      return this._courses();
    } finally {
      this._isLoading.set(false);
    }
  }

  async approveCourse(courseId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      await this.simulateApiCall();
      
      this._courses.update(courses => 
        courses.map(course => 
          course.id === courseId 
            ? { 
                ...course, 
                status: 'approved' as const, 
                approvedAt: new Date(),
                updatedAt: new Date() 
              }
            : course
        )
      );
      
      this.errorService.showSuccess('Khóa học đã được phê duyệt thành công!', 'course');
    } finally {
      this._isLoading.set(false);
    }
  }

  async rejectCourse(courseId: string, reason: string): Promise<void> {
    this._isLoading.set(true);
    try {
      await this.simulateApiCall();
      
      this._courses.update(courses => 
        courses.map(course => 
          course.id === courseId 
            ? { 
                ...course, 
                status: 'rejected' as const, 
                rejectionReason: reason,
                updatedAt: new Date() 
              }
            : course
        )
      );
      
      this.errorService.showSuccess('Khóa học đã bị từ chối.', 'course');
    } finally {
      this._isLoading.set(false);
    }
  }

  // Analytics Methods
  async getAnalytics(): Promise<AdminAnalytics> {
    this._isLoading.set(true);
    try {
      await this.simulateApiCall();
      
      const analytics: AdminAnalytics = {
        totalUsers: this._users().length,
        totalTeachers: this.totalTeachers(),
        totalStudents: this.totalStudents(),
        totalCourses: this._courses().length,
        pendingCourses: this.pendingCourses(),
        totalRevenue: this.totalRevenue(),
        monthlyRevenue: this.calculateMonthlyRevenue(),
        activeUsers: this.activeUsers(),
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          storage: 'healthy',
          email: 'warning'
        },
        userGrowth: {
          thisMonth: Math.floor(Math.random() * 50) + 20,
          lastMonth: Math.floor(Math.random() * 40) + 15,
          growthRate: Math.floor(Math.random() * 30) + 10
        },
        courseStats: {
          pending: this.pendingCourses(),
          approved: this.approvedCourses(),
          rejected: this._courses().filter(c => c.status === 'rejected').length,
          active: this._courses().filter(c => c.status === 'active').length
        },
        revenueStats: {
          thisMonth: this.calculateMonthlyRevenue(),
          lastMonth: this.calculateMonthlyRevenue() * 0.8,
          growthRate: 15
        },
        // Additional properties for admin dashboard
        studentGrowth: Math.floor(Math.random() * 20) + 10,
        courseGrowth: Math.floor(Math.random() * 15) + 5,
        revenue: this.totalRevenue(),
        revenueGrowth: Math.floor(Math.random() * 25) + 10,
        systemUptime: 99.9,
        onlineStudents: Math.floor(Math.random() * 50) + 20,
        activeCourses: this._courses().filter(c => c.status === 'active').length,
        pendingAssignments: Math.floor(Math.random() * 30) + 10,
        unreadMessages: Math.floor(Math.random() * 20) + 5
      };

      this._analytics.set(analytics);
      return analytics;
    } finally {
      this._isLoading.set(false);
    }
  }

  // Settings Methods
  async getSettings(): Promise<SystemSettings> {
    this._isLoading.set(true);
    try {
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

  // Password Generation and Email Sending
  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async sendWelcomeEmail(userData: { email: string; fullName: string; username: string; password: string; role: string }): Promise<void> {
    try {
      const emailData = {
        to: userData.email,
        subject: 'Chào mừng bạn đến với LMS Maritime - Thông tin tài khoản',
        template: 'welcome_new_user',
        templateData: {
          fullName: userData.fullName,
          username: userData.username,
          password: userData.password,
          role: this.getRoleDisplayName(userData.role),
          loginUrl: 'http://localhost:4200/auth/login'
        }
      };

      const response = await this.http.post<any>(
        `${this.API_BASE_URL}/emails/send-template`,
        emailData,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      if (response?.success) {
        console.log(`Welcome email sent successfully to ${userData.email}`);
      } else {
        console.warn(`Failed to send welcome email to ${userData.email}:`, response?.message);
        // Don't throw error here - user creation should still succeed even if email fails
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error - user creation should still succeed
    }
  }

  private getRoleDisplayName(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Học viên';
      default: return role;
    }
  }

  // Helper Methods
  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  private validateUserData(userData: Partial<AdminUser>): void {
    const requiredFields = ['email', 'name', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field as keyof AdminUser]);
    
    if (missingFields.length > 0) {
      throw new Error(`Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`);
    }
  }

  private async createUserViaAPI(userData: Partial<AdminUser>): Promise<AdminUser> {
    await this.simulateApiCall();
    
    const newUser: AdminUser = {
      id: this.generateId(),
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || UserRole.STUDENT,
      avatar: userData.avatar || this.getDefaultAvatar(userData.email || ''),
      department: userData.department || this.getDepartmentFromRole(userData.role || UserRole.STUDENT),
      studentId: userData.role === 'student' ? this.generateStudentId() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      lastLogin: new Date(),
      loginCount: 0,
      coursesCreated: userData.role === 'teacher' ? 0 : undefined,
      coursesEnrolled: userData.role === 'student' ? 0 : undefined,
      totalSpent: userData.role === 'student' ? 0 : undefined,
      permissions: this.getDefaultPermissions(userData.role || UserRole.STUDENT)
    };

    return newUser;
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

  private calculateMonthlyRevenue(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this._courses().reduce((sum, course) => {
      const courseDate = new Date(course.createdAt);
      if (courseDate.getMonth() === currentMonth && courseDate.getFullYear() === currentYear) {
        return sum + course.revenue;
      }
      return sum;
    }, 0);
  }

  private validateImportFile(file: File): void {
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Kích thước file không được vượt quá 10MB');
    }

    // Check file name
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      throw new Error('Tên file phải có đuôi .xlsx hoặc .xls');
    }
  }

  private generateMockImportedUsers(count: number, role: UserRole): AdminUser[] {
    const users: AdminUser[] = [];
    for (let i = 0; i < count; i++) {
      const id = `imported_${Date.now()}_${i}`;
      users.push({
        id,
        email: `imported${i}@student.edu.vn`,
        name: `Người dùng ${i + 1}`,
        role,
        avatar: this.getDefaultAvatar(`imported${i}@student.edu.vn`),
        department: this.getDepartmentFromRole(role),
        studentId: role === 'student' ? `SV${Date.now().toString().slice(-6)}${i}` : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLogin: new Date(),
        loginCount: 0,
        coursesCreated: role === 'teacher' ? 0 : undefined,
        coursesEnrolled: role === 'student' ? 0 : undefined,
        totalSpent: role === 'student' ? 0 : undefined,
        permissions: this.getDefaultPermissions(role)
      });
    }
    return users;
  }

  // Error handling
  private handleError(error: any, context: string): void {
    console.error(`AdminService Error [${context}]:`, error);
    
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          this.errorService.addError({ message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', type: 'error', context });
          break;
        case 401:
          this.errorService.addError({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', type: 'error', context });
          break;
        case 403:
          this.errorService.addError({ message: 'Bạn không có quyền thực hiện hành động này.', type: 'error', context });
          break;
        case 404:
          this.errorService.addError({ message: 'Không tìm thấy dữ liệu.', type: 'error', context });
          break;
        case 500:
          this.errorService.addError({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.', type: 'error', context });
          break;
        default:
          this.errorService.addError({ message: 'Có lỗi xảy ra. Vui lòng thử lại.', type: 'error', context });
      }
    } else if (error instanceof Error) {
      this.errorService.addError({ message: error.message, type: 'error', context });
    } else {
      this.errorService.addError({ message: 'Có lỗi không xác định xảy ra.', type: 'error', context });
    }
  }

  private loadMockData(): void {
    // Mock users
    const mockUsers: AdminUser[] = this.getMockUsers();
    const mockCourses: AdminCourse[] = this.getMockCourses();

    this._users.set(mockUsers);
    this._courses.set(mockCourses);
  }

  private getMockUsers(): AdminUser[] {
    return [
      {
        id: 'admin_1',
        email: 'admin@lms-maritime.com',
        name: 'Admin System',
        role: UserRole.ADMIN,
        avatar: 'https://ui-avatars.com/api/?name=Admin+System&background=dc2626&color=ffffff&size=150',
        department: 'Phòng Quản trị',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-09-20'),
        isActive: true,
        lastLogin: new Date('2024-09-22'),
        loginCount: 156,
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_courses', 'manage_system']
      },
      {
        id: 'teacher_1',
        email: 'teacher@lms-maritime.com',
        name: 'Nguyễn Văn Teacher',
        role: UserRole.TEACHER,
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Teacher&background=8b5cf6&color=ffffff&size=150',
        department: 'Khoa Hàng hải',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-09-21'),
        isActive: true,
        lastLogin: new Date('2024-09-21'),
        loginCount: 89,
        coursesCreated: 3,
        permissions: ['read', 'write', 'manage_courses', 'manage_students']
      },
      {
        id: 'student_1',
        email: 'student@lms-maritime.com',
        name: 'Trần Thị Student',
        role: UserRole.STUDENT,
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Student&background=3b82f6&color=ffffff&size=150',
        department: 'Khoa Hàng hải',
        studentId: 'SV2024001',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-09-20'),
        isActive: true,
        lastLogin: new Date('2024-09-20'),
        loginCount: 45,
        coursesEnrolled: 2,
        totalSpent: 5000000,
        permissions: ['read', 'enroll_courses']
      }
    ];
  }

  private getMockCourses(): AdminCourse[] {
    return [
      {
        id: 'course_admin_1',
        title: 'Kỹ thuật Tàu biển Cơ bản',
        description: 'Khóa học cung cấp kiến thức cơ bản về kỹ thuật tàu biển',
        shortDescription: 'Kiến thức cơ bản về kỹ thuật tàu biển',
        category: 'engineering',
        level: 'beginner',
        duration: '40 giờ',
        price: 2500000,
        thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
        status: 'pending',
        instructor: {
          id: 'teacher_1',
          name: 'Nguyễn Văn Teacher',
          email: 'teacher@lms-maritime.com',
          avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Teacher&background=8b5cf6&color=ffffff&size=150'
        },
        students: 0,
        rating: 0,
        revenue: 0,
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-09-20'),
        submittedAt: new Date('2024-09-20'),
        certificate: {
          type: 'STCW',
          description: 'Chứng chỉ STCW về kỹ thuật tàu biển'
        }
      },
      {
        id: 'course_admin_2',
        title: 'An toàn Hàng hải',
        description: 'Các quy định và thực hành an toàn trong ngành hàng hải',
        shortDescription: 'Quy định và thực hành an toàn hàng hải',
        category: 'safety',
        level: 'intermediate',
        duration: '32 giờ',
        price: 2000000,
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-14b1e3d71e51?w=300&h=200&fit=crop',
        status: 'approved',
        instructor: {
          id: 'teacher_1',
          name: 'Nguyễn Văn Teacher',
          email: 'teacher@lms-maritime.com',
          avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Teacher&background=8b5cf6&color=ffffff&size=150'
        },
        students: 32,
        rating: 4.6,
        revenue: 64000000,
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-18'),
        submittedAt: new Date('2024-09-15'),
        approvedAt: new Date('2024-09-16'),
        certificate: {
          type: 'IMO',
          description: 'Chứng chỉ IMO về an toàn hàng hải'
        }
      }
    ];
  }
}