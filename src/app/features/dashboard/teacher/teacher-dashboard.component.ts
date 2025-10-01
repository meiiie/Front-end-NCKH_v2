import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../teacher/services/teacher.service';
import { ResponsiveService } from '../../../shared/services/responsive.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface TeachingCourse {
  id: number;
  title: string;
  description: string;
  students: number;
  progress: number;
  status: 'active' | 'draft' | 'completed';
  startDate: string;
  endDate: string;
  thumbnail: string;
  revenue: number;
  rating: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  progress: number;
  lastActive: string;
  grade: number;
  avatar: string;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: 'pending' | 'graded' | 'overdue';
}

interface CourseAnalytics {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageGrade: number;
  revenue: number;
  rating: number;
}

@Component({
  selector: 'app-teacher-dashboard',
  imports: [CommonModule, RouterModule, LoadingComponent],
  template: `
    <!-- Loading State -->
    <app-loading 
      [show]="teacherService.isLoading()" 
      text="Đang tải dashboard..."
      subtext="Vui lòng chờ trong giây lát"
      variant="overlay"
      color="purple">
    </app-loading>

    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-indigo-600 via-purple-700 to-blue-800 text-white">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold mb-2">Chào mừng trở lại, {{ authService.userName() }}!</h1>
              <p class="text-indigo-100 text-lg">Quản lý khóa học và học viên của bạn một cách chuyên nghiệp</p>
              <div class="flex items-center space-x-6 mt-4">
                <div class="text-center">
                  <div class="text-2xl font-bold">{{ totalCourses() }}</div>
                  <div class="text-sm text-indigo-200">Khóa học</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold">{{ totalStudents() }}</div>
                  <div class="text-sm text-indigo-200">Học viên</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold">{{ averageRating() }}</div>
                  <div class="text-sm text-indigo-200">Đánh giá TB</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold">{{ formatCurrency(totalRevenue()) }}</div>
                  <div class="text-sm text-indigo-200">Doanh thu</div>
                </div>
              </div>
            </div>
          </div>
          <div class="hidden lg:block">
            <div class="text-right">
              <div class="text-sm text-indigo-200 mb-2">Hôm nay</div>
              <div class="text-3xl font-bold">{{ getCurrentDate() }}</div>
              <div class="text-sm text-indigo-200 mt-1">{{ getCurrentTime() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button (click)="navigateToCourseCreation()"
                  class="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 hover:border-blue-600">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Tạo khóa học</h3>
                <p class="text-sm text-gray-600">Tạo khóa học mới</p>
              </div>
            </div>
          </button>

          <button (click)="navigateToCourseManagement()"
                  class="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 hover:border-green-600">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Quản lý khóa học</h3>
                <p class="text-sm text-gray-600">Xem và chỉnh sửa khóa học</p>
              </div>
            </div>
          </button>

          <button (click)="navigateToAssignments()"
                  class="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500 hover:border-purple-600">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Bài tập</h3>
                <p class="text-sm text-gray-600">Tạo và chấm bài tập</p>
              </div>
            </div>
          </button>

          <button (click)="navigateToAnalytics()"
                  class="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500 hover:border-orange-600">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Phân tích</h3>
                <p class="text-sm text-gray-600">Báo cáo và thống kê</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-12 gap-8">
        <!-- Left Column - Recent Activity & Courses (8 columns) -->
        <div class="col-span-12 xl:col-span-8 space-y-8">
          <!-- Teaching Courses -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Khóa học của tôi</h3>
              <button (click)="navigateToCourseManagement()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Quản lý khóa học
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (course of teachingCourses(); track course.id) {
                <div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start space-x-4">
                    <img [src]="course.thumbnail" [alt]="course.title" class="w-20 h-20 rounded-lg object-cover">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-2">{{ course.title }}</h4>
                      <p class="text-sm text-gray-600 mb-3">{{ course.description }}</p>
                      <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{{ course.students }} học viên</span>
                        <span>{{ course.rating }}/5 ⭐</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="course.progress"></div>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">{{ course.progress }}% hoàn thành</span>
                        <span class="text-sm font-medium text-green-600">{{ formatCurrency(course.revenue) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent Students -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Học viên gần đây</h3>
            <div class="space-y-4">
              @for (student of recentStudents(); track student.id) {
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <img [src]="student.avatar" [alt]="student.name" class="w-12 h-12 rounded-full">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ student.name }}</h4>
                      <p class="text-sm text-gray-600">{{ student.course }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">{{ student.lastActive }}</p>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-medium text-gray-900">{{ student.grade }}/10</span>
                      <div class="w-20 bg-gray-200 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full" [style.width.%]="student.progress"></div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Column - Quick Actions & Analytics (4 columns) -->
        <div class="col-span-12 xl:col-span-4 space-y-8">
          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div class="space-y-3">
              <button (click)="navigateToCourseCreation()"
                      class="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-900">Tạo khóa học mới</span>
                </div>
              </button>
              <button (click)="navigateToAssignments()"
                      class="w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-900">Tạo bài tập</span>
                </div>
              </button>
              <button (click)="navigateToAnalytics()"
                      class="w-full text-left px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-900">Xem báo cáo</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Pending Assignments -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Bài tập chờ chấm</h3>
            <div class="space-y-3">
              @for (assignment of pendingAssignments(); track assignment.id) {
                <div class="p-3 bg-gray-50 rounded-lg">
                  <h4 class="font-medium text-gray-900 text-sm">{{ assignment.title }}</h4>
                  <p class="text-xs text-gray-600 mb-2">{{ assignment.course }}</p>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">{{ assignment.submissions }}/{{ assignment.totalStudents }} nộp bài</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" 
                          [class]="getAssignmentStatusClass(assignment.status)">
                      {{ getAssignmentStatusText(assignment.status) }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Course Analytics -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thống kê khóa học</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                <span class="text-sm font-medium text-gray-900">{{ courseAnalytics().completionRate }}%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Điểm trung bình</span>
                <span class="text-sm font-medium text-gray-900">{{ courseAnalytics().averageGrade }}/10</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Đánh giá</span>
                <span class="text-sm font-medium text-gray-900">{{ courseAnalytics().rating }}/5</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Học viên tích cực</span>
                <span class="text-sm font-medium text-gray-900">{{ courseAnalytics().activeStudents }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">💡 Mẹo hay</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <p>• Tạo bài tập thường xuyên để tăng tương tác học viên</p>
              <p>• Sử dụng video ngắn để giữ sự chú ý</p>
              <p>• Phản hồi nhanh để tăng điểm hài lòng</p>
              <p>• Cập nhật nội dung theo xu hướng mới</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class TeacherDashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  protected teacherService = inject(TeacherService);
  private responsive = inject(ResponsiveService);
  private router = inject(Router);

  // Computed properties using TeacherService data
  totalCourses = computed(() => this.teacherService.courses().length);
  totalStudents = computed(() => this.teacherService.totalStudents());
  totalRevenue = computed(() => this.teacherService.totalRevenue());

  averageRating = computed(() => {
    const courses = this.teacherService.courses().filter(course => course.rating > 0);
    if (courses.length === 0) return 0;
    return (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1);
  });

  // Mock data for teaching courses (converted from TeacherService data)
  teachingCourses = computed<TeachingCourse[]>(() => {
    return this.teacherService.courses().map(course => ({
      id: parseInt(course.id.replace('course_', '')),
      title: course.title,
      description: course.shortDescription,
      students: course.students,
      progress: Math.floor(Math.random() * 40) + 60, // Random progress between 60-100%
      status: course.status === 'active' ? 'active' : course.status === 'draft' ? 'draft' : 'completed',
      startDate: course.createdAt.toISOString().split('T')[0],
      endDate: new Date(course.createdAt.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      thumbnail: course.thumbnail,
      revenue: course.revenue,
      rating: course.rating
    }));
  });

  recentStudents = computed<Student[]>(() => {
    return this.teacherService.students().map(student => ({
      id: parseInt(student.id.replace('student_', '')),
      name: student.name,
      email: student.email,
      course: 'Kỹ thuật Tàu biển Cơ bản', // Default course name
      progress: student.progress,
      lastActive: this.formatLastActive(student.lastActive),
      grade: student.averageGrade,
      avatar: student.avatar
    }));
  });

  pendingAssignments = computed<Assignment[]>(() => {
    return this.teacherService.assignments().map(assignment => ({
      id: parseInt(assignment.id.replace('assignment_', '')),
      title: assignment.title,
      course: assignment.courseTitle,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      submissions: assignment.submissions,
      totalStudents: assignment.totalStudents,
      status: assignment.status === 'active' ? 'pending' : assignment.status === 'graded' ? 'graded' : 'overdue'
    }));
  });

  courseAnalytics = computed<CourseAnalytics>(() => ({
    totalStudents: this.totalStudents(),
    activeStudents: Math.floor(this.totalStudents() * 0.85),
    completionRate: 78,
    averageGrade: 8.7,
    revenue: this.totalRevenue(),
    rating: parseFloat(this.averageRating().toString())
  }));

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    await Promise.all([
      this.teacherService.getCourses(),
      this.teacherService.getStudents(),
      this.teacherService.getAssignments()
    ]);
  }

  // Navigation methods
  navigateToCourseCreation(): void {
    this.router.navigate(['/teacher/course-creation']);
  }

  navigateToCourseManagement(): void {
    this.router.navigate(['/teacher/courses']);
  }

  navigateToAssignments(): void {
    this.router.navigate(['/teacher/assignments']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/teacher/analytics']);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatLastActive(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  }

  getAssignmentStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getAssignmentStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Chờ chấm';
      case 'graded':
        return 'Đã chấm';
      case 'overdue':
        return 'Quá hạn';
      default:
        return 'Không xác định';
    }
  }

  getAverageRating(): string {
    return this.courseAnalytics().rating.toFixed(1);
  }
}