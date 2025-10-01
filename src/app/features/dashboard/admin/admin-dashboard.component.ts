import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ResponsiveService } from '../../../shared/services/responsive.service';

interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeUsers: number;
  newUsers: number;
  completedCourses: number;
  averageRating: number;
  systemUptime: string;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'course' | 'payment' | 'system';
  description: string;
  timestamp: string;
  user: string;
  status: 'success' | 'warning' | 'error';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  coursesEnrolled: number;
  avatar: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  students: number;
  revenue: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  rating: number;
  thumbnail: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 text-white">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold">Chào mừng trở lại, {{ authService.userName() }}!</h1>
              <p class="text-purple-100 mt-1">Quản lý hệ thống và người dùng</p>
            </div>
          </div>
          <div class="hidden md:flex items-center space-x-6">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ systemStats().totalUsers }}</div>
              <div class="text-sm text-purple-200">Người dùng</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ systemStats().totalCourses }}</div>
              <div class="text-sm text-purple-200">Khóa học</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ systemStats().systemUptime }}</div>
              <div class="text-sm text-purple-200">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- System Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Tổng người dùng</p>
                <p class="text-3xl font-bold text-gray-900">{{ systemStats().totalUsers }}</p>
                <p class="text-sm text-green-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  +{{ systemStats().newUsers }} mới
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 8v1h1.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5H8v-1a5 5 0 00-5 5v1h9.93z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Khóa học</p>
                <p class="text-3xl font-bold text-gray-900">{{ systemStats().totalCourses }}</p>
                <p class="text-sm text-green-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ systemStats().completedCourses }} hoàn thành
                </p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Doanh thu</p>
                <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(systemStats().totalRevenue) }}</p>
                <p class="text-sm text-purple-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  +25% tháng này
                </p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Đánh giá TB</p>
                <p class="text-3xl font-bold text-gray-900">{{ systemStats().averageRating }}</p>
                <p class="text-sm text-orange-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  Xuất sắc
                </p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Left Column - Recent Activity (8 columns) -->
          <div class="col-span-12 xl:col-span-8 space-y-6">
            <!-- Recent Activity -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Hoạt động gần đây</h3>
              <div class="space-y-4">
                @for (activity of recentActivities(); track activity.id) {
                  <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" [class]="getActivityIconClass(activity.type)">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path [attr.d]="getActivityIconPath(activity.type)"></path>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                      <p class="text-xs text-gray-500">{{ activity.user }} • {{ activity.timestamp }}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="getActivityStatusClass(activity.status)">
                      {{ getActivityStatusText(activity.status) }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Top Courses -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Khóa học phổ biến</h3>
              <div class="space-y-4">
                @for (course of topCourses(); track course.id) {
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-4">
                      <img [src]="course.thumbnail" [alt]="course.title" class="w-12 h-12 rounded-lg object-cover">
                      <div>
                        <h4 class="font-medium text-gray-900">{{ course.title }}</h4>
                        <p class="text-sm text-gray-600">{{ course.instructor }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ course.students }} học viên</p>
                      <p class="text-sm text-gray-500">{{ formatCurrency(course.revenue) }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Right Column - Quick Actions & Users (4 columns) -->
          <div class="col-span-12 xl:col-span-4 space-y-6">
            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div class="space-y-3">
                <button class="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 8v1h1.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5H8v-1a5 5 0 00-5 5v1h9.93z"></path>
                    </svg>
                    <span class="text-gray-900">Quản lý người dùng</span>
                  </div>
                </button>
                <button class="w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-900">Quản lý khóa học</span>
                  </div>
                </button>
                <button class="w-full text-left px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-900">Xem báo cáo</span>
                  </div>
                </button>
                <button class="w-full text-left px-4 py-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-900">Cài đặt hệ thống</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Recent Users -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Người dùng mới</h3>
              <div class="space-y-3">
                @for (user of recentUsers(); track user.id) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <img [src]="user.avatar" [alt]="user.name" class="w-8 h-8 rounded-full">
                      <div>
                        <h4 class="font-medium text-gray-900 text-sm">{{ user.name }}</h4>
                        <p class="text-xs text-gray-600">{{ getRoleDisplayName(user.role) }}</p>
                      </div>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="getUserStatusClass(user.status)">
                      {{ getUserStatusText(user.status) }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
  `,
  standalone: true
})
export class AdminDashboardComponent {
  protected authService = inject(AuthService);
  private responsive = inject(ResponsiveService);

  // Mock data
  systemStats = computed<SystemStats>(() => ({
    totalUsers: 1234,
    totalCourses: 45,
    totalRevenue: 125000000,
    activeUsers: 856,
    newUsers: 23,
    completedCourses: 234,
    averageRating: 4.8,
    systemUptime: '99.9%'
  }));

  recentActivities = computed<RecentActivity[]>(() => [
    {
      id: 1,
      type: 'user',
      description: 'Người dùng mới đăng ký: Nguyễn Văn A',
      timestamp: '2 phút trước',
      user: 'System',
      status: 'success'
    },
    {
      id: 2,
      type: 'course',
      description: 'Khóa học "An toàn Hàng hải" được tạo',
      timestamp: '15 phút trước',
      user: 'ThS. Nguyễn Văn B',
      status: 'success'
    },
    {
      id: 3,
      type: 'payment',
      description: 'Thanh toán thành công: 1,500,000 VND',
      timestamp: '1 giờ trước',
      user: 'Trần Thị C',
      status: 'success'
    },
    {
      id: 4,
      type: 'system',
      description: 'Hệ thống backup hoàn thành',
      timestamp: '2 giờ trước',
      user: 'System',
      status: 'success'
    }
  ]);

  recentUsers = computed<User[]>(() => [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      role: 'student',
      status: 'active',
      lastLogin: '2 giờ trước',
      coursesEnrolled: 3,
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=ffffff&size=150'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      role: 'teacher',
      status: 'active',
      lastLogin: '4 giờ trước',
      coursesEnrolled: 0,
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=10b981&color=ffffff&size=150'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      role: 'student',
      status: 'inactive',
      lastLogin: '1 ngày trước',
      coursesEnrolled: 2,
      avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=8b5cf6&color=ffffff&size=150'
    }
  ]);

  topCourses = computed<Course[]>(() => [
    {
      id: 1,
      title: 'Kỹ thuật Tàu biển Cơ bản',
      instructor: 'ThS. Nguyễn Văn Hải',
      students: 156,
      revenue: 7800000,
      status: 'active',
      createdAt: '2024-08-01',
      rating: 4.8,
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'An toàn Hàng hải',
      instructor: 'TS. Trần Thị Lan',
      students: 134,
      revenue: 6700000,
      status: 'active',
      createdAt: '2024-07-15',
      rating: 4.6,
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-14b1e3d71e51?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Quản lý Cảng biển',
      instructor: 'ThS. Lê Văn Minh',
      students: 98,
      revenue: 4900000,
      status: 'active',
      createdAt: '2024-06-20',
      rating: 4.7,
      thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop'
    }
  ]);

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'student':
        return 'Sinh viên';
      case 'teacher':
        return 'Giảng viên';
      case 'admin':
        return 'Quản trị viên';
      default:
        return 'Người dùng';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-600';
      case 'course':
        return 'bg-green-100 text-green-600';
      case 'payment':
        return 'bg-purple-100 text-purple-600';
      case 'system':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getActivityIconPath(type: string): string {
    switch (type) {
      case 'user':
        return 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 8v1h1.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5H8v-1a5 5 0 00-5 5v1h9.93z';
      case 'course':
        return 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z';
      case 'payment':
        return 'M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267zM10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z';
      case 'system':
        return 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z';
      default:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getActivityStatusClass(status: string): string {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getActivityStatusText(status: string): string {
    switch (status) {
      case 'success':
        return 'Thành công';
      case 'warning':
        return 'Cảnh báo';
      case 'error':
        return 'Lỗi';
      default:
        return 'Không xác định';
    }
  }

  getUserStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUserStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'suspended':
        return 'Bị khóa';
      default:
        return 'Không xác định';
    }
  }
}
