import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService, AdminAnalytics } from '../../infrastructure/services/admin.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule, LoadingComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Admin Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Bảng điều khiển Quản trị</h1>
              <p class="text-sm text-gray-600 mt-1">Quản lý hệ thống và tổng quan phân tích</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Xuất báo cáo
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="px-6 py-8">
          <app-loading></app-loading>
        </div>
      } @else {
        <!-- Stats Overview -->
        <div class="px-6 py-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Students -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Tổng học viên</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics().totalStudents | number }}</p>
                  <p class="text-sm text-green-600 mt-1">+{{ analytics().studentGrowth }}% so với tháng trước</p>
                </div>
              </div>
            </div>

            <!-- Total Courses -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Tổng khóa học</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics().totalCourses }}</p>
                  <p class="text-sm text-green-600 mt-1">+{{ analytics().courseGrowth }} khóa mới tháng này</p>
                </div>
              </div>
            </div>

            <!-- Revenue -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics().revenue | currency:'VND':'symbol':'1.0-0' }}</p>
                  <p class="text-sm text-green-600 mt-1">+{{ analytics().revenueGrowth }}% tháng này</p>
                </div>
              </div>
            </div>

            <!-- System Health -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Tình trạng hệ thống</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics().systemUptime }}%</p>
                  <p class="text-sm text-green-600 mt-1">Tất cả hệ thống hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column - Management Tools -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Quick Actions -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Thao tác nhanh</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button (click)="navigateToUserManagement()" class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 group text-left">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors mr-4">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 group-hover:text-blue-700">Quản lý người dùng</h4>
                      <p class="text-sm text-gray-600">Thêm, sửa, xóa người dùng</p>
                    </div>
                  </button>

                  <button (click)="navigateToCourseManagement()" class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200 group text-left">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors mr-4">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 group-hover:text-green-700">Quản lý khóa học</h4>
                      <p class="text-sm text-gray-600">Tạo và chỉnh sửa khóa học</p>
                    </div>
                  </button>

                  <button (click)="navigateToAnalytics()" class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200 group text-left">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors mr-4">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 group-hover:text-purple-700">Phân tích & Báo cáo</h4>
                      <p class="text-sm text-gray-600">Xem báo cáo chi tiết</p>
                    </div>
                  </button>

                  <button (click)="navigateToSystemSettings()" class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors duration-200 group text-left">
                    <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors mr-4">
                      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 group-hover:text-yellow-700">Cài đặt hệ thống</h4>
                      <p class="text-sm text-gray-600">Cấu hình và bảo trì</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- System Status -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Trạng thái hệ thống</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-900">Cơ sở dữ liệu</span>
                      </div>
                      <span class="text-sm text-green-700 font-medium">Online</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-900">Máy chủ API</span>
                      </div>
                      <span class="text-sm text-green-700 font-medium">Khỏe mạnh</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-900">Lưu trữ tệp</span>
                      </div>
                      <span class="text-sm text-green-700 font-medium">Khả dụng</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-900">Dịch vụ Email</span>
                      </div>
                      <span class="text-sm text-yellow-700 font-medium">Chậm</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-900">CDN</span>
                      </div>
                      <span class="text-sm text-green-700 font-medium">Nhanh</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-900">Chứng chỉ SSL</span>
                      </div>
                      <span class="text-sm text-green-700 font-medium">Hợp lệ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Sidebar -->
            <div class="space-y-6">
              <!-- Recent Activity -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
                <div class="space-y-3">
                  @for (activity of recentActivities(); track activity.id) {
                    <div class="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-900">{{ activity.message }}</p>
                        <p class="text-xs text-gray-500">{{ activity.timestamp | date:'short' }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Học viên online</span>
                    <span class="text-lg font-semibold text-gray-900">{{ analytics().onlineStudents }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Khóa học đang diễn ra</span>
                    <span class="text-lg font-semibold text-gray-900">{{ analytics().activeCourses }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Bài tập chưa chấm</span>
                    <span class="text-lg font-semibold text-gray-900">{{ analytics().pendingAssignments }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Tin nhắn chưa đọc</span>
                    <span class="text-lg font-semibold text-gray-900">{{ analytics().unreadMessages }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  isLoading = signal(true);
  analytics = signal<AdminAnalytics>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    systemHealth: {
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
      email: 'healthy'
    },
    userGrowth: {
      thisMonth: 0,
      lastMonth: 0,
      growthRate: 0
    },
    courseStats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      active: 0
    },
    revenueStats: {
      thisMonth: 0,
      lastMonth: 0,
      growthRate: 0
    },
    studentGrowth: 0,
    courseGrowth: 0,
    revenue: 0,
    revenueGrowth: 0,
    systemUptime: 0,
    onlineStudents: 0,
    activeCourses: 0,
    pendingAssignments: 0,
    unreadMessages: 0
  });

  recentActivities = signal([
    { id: 1, message: 'Người dùng mới đăng ký', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: 2, message: 'Khóa học mới được tạo', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 3, message: 'Cảnh báo: Dịch vụ email chậm', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    { id: 4, message: 'Sao lưu dữ liệu hoàn tất', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) }
  ]);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.adminService.getAnalytics().then((data) => {
      this.analytics.set(data);
      this.isLoading.set(false);
    }).catch((error) => {
      console.error('Error loading analytics:', error);
      this.isLoading.set(false);
    });
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToCourseManagement(): void {
    this.router.navigate(['/admin/courses']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }

  navigateToSystemSettings(): void {
    this.router.navigate(['/admin/settings']);
  }
}