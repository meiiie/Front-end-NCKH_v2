import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
import { environment } from '../../../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private errorService = inject(ErrorHandlingService);

  // API Configuration
  private readonly API_BASE_URL = `${environment.apiUrl}/api/v1`;
  private readonly ENDPOINTS = {
    analytics: '/analytics',
    system: '/system'
  };

  // Signals for reactive state management
  private _analytics = signal<AdminAnalytics | null>(null);
  private _isLoading = signal<boolean>(false);

  // Readonly signals for external consumption
  readonly analytics = this._analytics.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Analytics Methods
  async getAnalytics(): Promise<AdminAnalytics> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
      // For now, return mock analytics data
      await this.simulateApiCall();

      const analytics: AdminAnalytics = {
        totalUsers: 0, // Will be set by UserManagementService
        totalTeachers: 0,
        totalStudents: 0,
        totalCourses: 0, // Will be set by CourseManagementService
        pendingCourses: 0,
        totalRevenue: 0,
        monthlyRevenue: this.calculateMonthlyRevenue(),
        activeUsers: 0,
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
          pending: 0, // Will be set by CourseManagementService
          approved: 0,
          rejected: 0,
          active: 0
        },
        revenueStats: {
          thisMonth: this.calculateMonthlyRevenue(),
          lastMonth: this.calculateMonthlyRevenue() * 0.8,
          growthRate: 15
        },
        // Additional properties for admin dashboard
        studentGrowth: Math.floor(Math.random() * 20) + 10,
        courseGrowth: Math.floor(Math.random() * 15) + 5,
        revenue: 0, // Will be set by CourseManagementService
        revenueGrowth: Math.floor(Math.random() * 25) + 10,
        systemUptime: 99.9,
        onlineStudents: Math.floor(Math.random() * 50) + 20,
        activeCourses: 0, // Will be set by CourseManagementService
        pendingAssignments: Math.floor(Math.random() * 30) + 10,
        unreadMessages: Math.floor(Math.random() * 20) + 5
      };

      this._analytics.set(analytics);
      return analytics;
    } finally {
      this._isLoading.set(false);
    }
  }

  // System Health Methods
  async getSystemHealth(): Promise<AdminAnalytics['systemHealth']> {
    try {
      // In production, this would call system health API
      await this.simulateApiCall();

      return {
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy',
        email: 'warning'
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      return {
        database: 'error',
        api: 'error',
        storage: 'error',
        email: 'error'
      };
    }
  }

  async checkDatabaseHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // In production, this would ping database
      await this.simulateApiCall();
      return 'healthy';
    } catch (error) {
      return 'error';
    }
  }

  async checkApiHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // In production, this would ping API endpoints
      await this.simulateApiCall();
      return 'healthy';
    } catch (error) {
      return 'error';
    }
  }

  async checkStorageHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // In production, this would check file storage
      await this.simulateApiCall();
      return 'healthy';
    } catch (error) {
      return 'error';
    }
  }

  async checkEmailHealth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // In production, this would test email service
      await this.simulateApiCall();
      // Simulate occasional email issues
      return Math.random() > 0.8 ? 'warning' : 'healthy';
    } catch (error) {
      return 'error';
    }
  }

  // User Analytics Methods
  getUserGrowthData(): Promise<{ month: string; users: number; growth: number }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [
          { month: 'Jan', users: 120, growth: 15 },
          { month: 'Feb', users: 135, growth: 12 },
          { month: 'Mar', users: 148, growth: 10 },
          { month: 'Apr', users: 162, growth: 9 },
          { month: 'May', users: 178, growth: 10 },
          { month: 'Jun', users: 195, growth: 10 },
          { month: 'Jul', users: 210, growth: 8 },
          { month: 'Aug', users: 225, growth: 7 },
          { month: 'Sep', users: 240, growth: 7 },
          { month: 'Oct', users: 258, growth: 8 },
          { month: 'Nov', users: 275, growth: 7 },
          { month: 'Dec', users: 290, growth: 5 }
        ];
        resolve(data);
      }, 500);
    });
  }

  getCourseEnrollmentData(): Promise<{ course: string; enrollments: number; revenue: number }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [
          { course: 'Kỹ thuật Tàu biển', enrollments: 45, revenue: 112500000 },
          { course: 'An toàn Hàng hải', enrollments: 32, revenue: 64000000 },
          { course: 'Điều khiển Tàu', enrollments: 28, revenue: 56000000 },
          { course: 'Luật Hàng hải', enrollments: 22, revenue: 44000000 },
          { course: 'Logistics Biển', enrollments: 18, revenue: 36000000 }
        ];
        resolve(data);
      }, 500);
    });
  }

  getRevenueByMonth(): Promise<{ month: string; revenue: number; growth: number }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [
          { month: 'Jan', revenue: 85000000, growth: 20 },
          { month: 'Feb', revenue: 92000000, growth: 8 },
          { month: 'Mar', revenue: 101000000, growth: 10 },
          { month: 'Apr', revenue: 118000000, growth: 17 },
          { month: 'May', revenue: 125000000, growth: 6 },
          { month: 'Jun', revenue: 138000000, growth: 10 },
          { month: 'Jul', revenue: 142000000, growth: 3 },
          { month: 'Aug', revenue: 156000000, growth: 10 },
          { month: 'Sep', revenue: 168000000, growth: 8 },
          { month: 'Oct', revenue: 175000000, growth: 4 },
          { month: 'Nov', revenue: 182000000, growth: 4 },
          { month: 'Dec', revenue: 195000000, growth: 7 }
        ];
        resolve(data);
      }, 500);
    });
  }

  // Performance Analytics Methods
  getPageLoadTimes(): Promise<{ page: string; loadTime: number; status: 'good' | 'warning' | 'poor' }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [
          { page: 'Dashboard', loadTime: 1.2, status: 'good' as const },
          { page: 'Course List', loadTime: 2.1, status: 'good' as const },
          { page: 'User Management', loadTime: 3.5, status: 'warning' as const },
          { page: 'Analytics', loadTime: 4.2, status: 'warning' as const },
          { page: 'Settings', loadTime: 1.8, status: 'good' as const }
        ];
        resolve(data);
      }, 500);
    });
  }

  getApiResponseTimes(): Promise<{ endpoint: string; responseTime: number; status: 'good' | 'warning' | 'poor' }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [
          { endpoint: '/api/users', responseTime: 120, status: 'good' as const },
          { endpoint: '/api/courses', responseTime: 180, status: 'good' as const },
          { endpoint: '/api/analytics', responseTime: 350, status: 'warning' as const },
          { endpoint: '/api/reports', responseTime: 520, status: 'warning' as const },
          { endpoint: '/api/uploads', responseTime: 890, status: 'poor' as const }
        ];
        resolve(data);
      }, 500);
    });
  }

  // Real-time Analytics Methods
  getActiveUsersCount(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * 50) + 20);
      }, 200);
    });
  }

  getCurrentServerLoad(): Promise<{ cpu: number; memory: number; disk: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          cpu: Math.floor(Math.random() * 40) + 20,
          memory: Math.floor(Math.random() * 30) + 40,
          disk: Math.floor(Math.random() * 20) + 10
        });
      }, 200);
    });
  }

  // Helper Methods
  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private calculateMonthlyRevenue(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Mock calculation - in production this would come from actual data
    return Math.floor(Math.random() * 50000000) + 100000000;
  }

  // Update analytics with data from other services
  updateAnalyticsWithUserData(userData: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    activeUsers: number;
  }): void {
    const currentAnalytics = this._analytics();
    if (currentAnalytics) {
      this._analytics.set({
        ...currentAnalytics,
        totalUsers: userData.totalUsers,
        totalTeachers: userData.totalTeachers,
        totalStudents: userData.totalStudents,
        activeUsers: userData.activeUsers
      });
    }
  }

  updateAnalyticsWithCourseData(courseData: {
    totalCourses: number;
    pendingCourses: number;
    approvedCourses: number;
    totalRevenue: number;
  }): void {
    const currentAnalytics = this._analytics();
    if (currentAnalytics) {
      this._analytics.set({
        ...currentAnalytics,
        totalCourses: courseData.totalCourses,
        pendingCourses: courseData.pendingCourses,
        courseStats: {
          ...currentAnalytics.courseStats,
          pending: courseData.pendingCourses,
          approved: courseData.approvedCourses
        },
        revenue: courseData.totalRevenue,
        totalRevenue: courseData.totalRevenue,
        activeCourses: courseData.approvedCourses
      });
    }
  }
}