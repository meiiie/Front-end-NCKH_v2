import { Injectable, inject } from '@angular/core';
import { UserManagementService, AdminUser, UserRole, UsersResponse, BulkImportProgress, BulkImportResult } from './user-management.service';
import { CourseManagementService, AdminCourse } from './course-management.service';
import { AnalyticsService, AdminAnalytics } from './analytics.service';
import { SystemSettingsService, SystemSettings } from './system-settings.service';
import { FileUploadService, UploadResult } from './file-upload.service';

// Re-export types for backward compatibility
export type { AdminUser, AdminCourse, AdminAnalytics, SystemSettings, UploadResult, BulkImportProgress, BulkImportResult };
export { UserRole };

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Inject the specialized services
  private userManagementService = inject(UserManagementService);
  private courseManagementService = inject(CourseManagementService);
  private analyticsService = inject(AnalyticsService);
  private systemSettingsService = inject(SystemSettingsService);
  private fileUploadService = inject(FileUploadService);

  // Delegate to specialized services - User Management
  readonly users = this.userManagementService.users;
  readonly isLoading = this.userManagementService.isLoading;
  readonly pagination = this.userManagementService.pagination;
  readonly bulkImportProgress = this.userManagementService.bulkImportProgress;
  readonly totalUsers = this.userManagementService.totalUsers;
  readonly totalTeachers = this.userManagementService.totalTeachers;
  readonly totalStudents = this.userManagementService.totalStudents;
  readonly totalAdmins = this.userManagementService.totalAdmins;
  readonly activeUsers = this.userManagementService.activeUsers;

  // Delegate to specialized services - Course Management
  readonly courses = this.courseManagementService.courses;
  readonly pendingCourses = this.courseManagementService.pendingCourses;
  readonly approvedCourses = this.courseManagementService.approvedCourses;
  readonly totalCourses = this.courseManagementService.totalCourses;
  readonly totalRevenue = this.courseManagementService.totalRevenue;

  // Delegate to specialized services - Analytics
  readonly analytics = this.analyticsService.analytics;

  // Delegate to specialized services - Settings
  readonly settings = this.systemSettingsService.settings;

  // Delegate to specialized services - File Upload
  readonly uploadProgress = this.fileUploadService.uploadProgress;
  readonly isUploading = this.fileUploadService.isUploading;

  // ========================================
  // USER MANAGEMENT METHODS
  // ========================================

  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<UsersResponse> {
    return this.userManagementService.getUsers(page, limit, search);
  }

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.userManagementService.createUser(userData);
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    return this.userManagementService.updateUser(userId, updates);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.userManagementService.deleteUser(userId);
  }

  async toggleUserStatus(userId: string): Promise<void> {
    return this.userManagementService.toggleUserStatus(userId);
  }

  async bulkImportUsers(file: File, defaultRole: UserRole = UserRole.STUDENT): Promise<BulkImportResult> {
    return this.userManagementService.bulkImportUsers(file, defaultRole);
  }

  resetBulkImportProgress(): void {
    this.userManagementService.resetBulkImportProgress();
  }

  // ========================================
  // COURSE MANAGEMENT METHODS
  // ========================================

  async getCourses(): Promise<AdminCourse[]> {
    return this.courseManagementService.getCourses();
  }

  async approveCourse(courseId: string): Promise<void> {
    return this.courseManagementService.approveCourse(courseId);
  }

  async rejectCourse(courseId: string, reason: string): Promise<void> {
    return this.courseManagementService.rejectCourse(courseId, reason);
  }

  async createCourse(courseData: Partial<AdminCourse>): Promise<AdminCourse> {
    return this.courseManagementService.createCourse(courseData);
  }

  async updateCourse(courseId: string, updates: Partial<AdminCourse>): Promise<AdminCourse> {
    return this.courseManagementService.updateCourse(courseId, updates);
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.courseManagementService.deleteCourse(courseId);
  }

  // ========================================
  // ANALYTICS METHODS
  // ========================================

  async getAnalytics(): Promise<AdminAnalytics> {
    return this.analyticsService.getAnalytics();
  }

  // ========================================
  // SYSTEM SETTINGS METHODS
  // ========================================

  async getSettings(): Promise<SystemSettings> {
    return this.systemSettingsService.getSettings();
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    return this.systemSettingsService.updateSettings(settings);
  }

  async updateGeneralSettings(generalSettings: Partial<SystemSettings['general']>): Promise<void> {
    return this.systemSettingsService.updateGeneralSettings(generalSettings);
  }

  async updateEmailSettings(emailSettings: Partial<SystemSettings['email']>): Promise<void> {
    return this.systemSettingsService.updateEmailSettings(emailSettings);
  }

  async updatePaymentSettings(paymentSettings: Partial<SystemSettings['payment']>): Promise<void> {
    return this.systemSettingsService.updatePaymentSettings(paymentSettings);
  }

  async updateSecuritySettings(securitySettings: Partial<SystemSettings['security']>): Promise<void> {
    return this.systemSettingsService.updateSecuritySettings(securitySettings);
  }

  async testEmailSettings(): Promise<{ success: boolean; message: string }> {
    return this.systemSettingsService.testEmailSettings();
  }

  async testPaymentSettings(): Promise<{ success: boolean; message: string }> {
    return this.systemSettingsService.testPaymentSettings();
  }

  async createBackup(): Promise<{ success: boolean; backupId: string; downloadUrl: string }> {
    return this.systemSettingsService.createBackup();
  }

  async restoreFromBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    return this.systemSettingsService.restoreFromBackup(backupId);
  }

  async getBackupHistory(): Promise<{ id: string; createdAt: Date; size: string; status: 'completed' | 'failed' }[]> {
    return this.systemSettingsService.getBackupHistory();
  }

  // ========================================
  // FILE UPLOAD METHODS
  // ========================================

  async uploadFile(file: File, type: string = 'document'): Promise<UploadResult> {
    return this.fileUploadService.uploadFile(file, type);
  }

  async uploadMultipleFiles(files: File[], type: string = 'document'): Promise<UploadResult[]> {
    return this.fileUploadService.uploadMultipleFiles(files, type);
  }

  async getUploadHistory(page: number = 1, limit: number = 20): Promise<{
    files: UploadResult[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.fileUploadService.getUploadHistory(page, limit);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.fileUploadService.deleteFile(fileUrl);
  }

  resetUploadProgress(): void {
    this.fileUploadService.resetUploadProgress();
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }
}