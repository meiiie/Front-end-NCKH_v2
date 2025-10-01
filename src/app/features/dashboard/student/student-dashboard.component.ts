import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ResponsiveService } from '../../../shared/services/responsive.service';

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  deadline: string;
  status: 'enrolled' | 'in-progress' | 'completed';
  thumbnail: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  type: 'quiz' | 'assignment' | 'project';
  status: 'pending' | 'submitted' | 'graded';
}

interface LearningProgress {
  category: string;
  completed: number;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.285.985.985 0 00.15-.76V9.397zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold">Chào mừng trở lại!</h1>
              <p class="text-blue-100 mt-1">{{ authService.currentUser()?.name || 'Học viên' }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-blue-100">Tiến độ trung bình</div>
            <div class="text-3xl font-bold">{{ averageProgress() }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ enrolledCourses().length }}</div>
              <div class="text-sm text-gray-600">Khóa học đã đăng ký</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ completedCourses().length }}</div>
              <div class="text-sm text-gray-600">Khóa học hoàn thành</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ pendingAssignments().length }}</div>
              <div class="text-sm text-gray-600">Bài tập chờ xử lý</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ averageGrade() }}</div>
              <div class="text-sm text-gray-600">Điểm trung bình</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Continue Learning -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Tiếp tục học tập</h3>
          <div class="space-y-4">
            @for (course of enrolledCourses().slice(0, 3); track course.id) {
              <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img [src]="course.thumbnail" [alt]="course.title" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ course.title }}</h4>
                  <p class="text-sm text-gray-600">{{ course.completedLessons }}/{{ course.totalLessons }} bài học</p>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="course.progress"></div>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button 
                    (click)="continueLearning(course.id)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Tiếp tục
                  </button>
                </div>
              </div>
            }
          </div>
          <div class="mt-4">
            <button 
              (click)="viewAllCourses()"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Xem tất cả khóa học
            </button>
          </div>
        </div>

        <!-- Recent Assignments -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Bài tập gần đây</h3>
          <div class="space-y-4">
            @for (assignment of pendingAssignments().slice(0, 3); track assignment.id) {
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ assignment.title }}</h4>
                    <p class="text-sm text-gray-600">{{ assignment.course }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">{{ assignment.dueDate }}</p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {{ assignment.status }}
                  </span>
                  <button 
                    (click)="viewAssignment(assignment.id)"
                    class="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            }
          </div>
          <div class="mt-4">
            <button 
              (click)="goToAssignments()"
              class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              Xem tất cả bài tập
            </button>
          </div>
        </div>
      </div>

        <!-- Learning Paths Section -->
        <div class="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold">Learning Paths</h3>
              <p class="text-green-100">Lộ trình học tập được cá nhân hóa cho bạn</p>
            </div>
            <button (click)="goToLearningPaths()"
                    class="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 backdrop-blur-sm">
              Xem chi tiết
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">2</div>
              <div class="text-sm text-green-100">Lộ trình được gợi ý</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">1</div>
              <div class="text-sm text-green-100">Đang học</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">0</div>
              <div class="text-sm text-green-100">Đã hoàn thành</div>
            </div>
          </div>
        </div>

        <!-- Communication Section -->
        <div class="mt-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold">Communication Hub</h3>
              <p class="text-indigo-100">Kết nối và học tập cùng bạn bè</p>
            </div>
            <button (click)="goToCommunication()"
                    class="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 backdrop-blur-sm">
              Xem chi tiết
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">3</div>
              <div class="text-sm text-indigo-100">Tin nhắn chưa đọc</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">2</div>
              <div class="text-sm text-indigo-100">Study Groups</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">1</div>
              <div class="text-sm text-indigo-100">Live Sessions</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">5</div>
              <div class="text-sm text-indigo-100">Thông báo mới</div>
            </div>
          </div>
        </div>

        <!-- Gamification Section -->
        <div class="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold">Gamification Dashboard</h3>
              <p class="text-purple-100">Theo dõi thành tích và tiến độ học tập của bạn</p>
            </div>
            <button (click)="goToGamification()"
                    class="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 backdrop-blur-sm">
              Xem chi tiết
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">950</div>
              <div class="text-sm text-purple-100">Tổng điểm</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">5</div>
              <div class="text-sm text-purple-100">Thành tựu</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">6</div>
              <div class="text-sm text-purple-100">Chuỗi học tập</div>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">#4</div>
              <div class="text-sm text-purple-100">Xếp hạng</div>
            </div>
          </div>
        </div>
    </div>
  `,
  standalone: true
})
export class StudentDashboardComponent {
  protected authService = inject(AuthService);
  private responsive = inject(ResponsiveService);
  private router = inject(Router);

  // Mock data - In real app, this would come from a service
  enrolledCourses = computed<EnrolledCourse[]>(() => [
    {
      id: 1,
      title: 'Kỹ thuật Tàu biển Cơ bản',
      description: 'Khóa học cung cấp kiến thức cơ bản về kỹ thuật tàu biển',
      instructor: 'ThS. Nguyễn Văn Hải',
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      duration: '8 tuần',
      deadline: '2024-12-31',
      status: 'in-progress',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'An toàn Hàng hải',
      description: 'Các quy định và thực hành an toàn trong ngành hàng hải',
      instructor: 'TS. Trần Thị Lan',
      progress: 45,
      totalLessons: 10,
      completedLessons: 4,
      duration: '6 tuần',
      deadline: '2024-11-30',
      status: 'in-progress',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-14b1e3d71e51?w=300&h=200&fit=crop'
    }
  ]);

  pendingAssignments = computed<Assignment[]>(() => [
    {
      id: 1,
      title: 'Bài tập về Cấu trúc Tàu',
      description: 'Phân tích cấu trúc tàu container',
      course: 'Kỹ thuật Tàu biển Cơ bản',
      dueDate: '2024-09-15',
      type: 'assignment',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Quiz An toàn Hàng hải',
      description: 'Kiểm tra kiến thức về quy định an toàn',
      course: 'An toàn Hàng hải',
      dueDate: '2024-09-20',
      type: 'quiz',
      status: 'pending'
    }
  ]);

  averageProgress = computed(() => {
    const courses = this.enrolledCourses();
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length);
  });

  averageGrade = computed(() => {
    // Mock average grade
    return '8.5';
  });

  completedCourses = computed(() => {
    return this.enrolledCourses().filter(course => course.progress === 100);
  });

  // Click handlers
  continueLearning(courseId: number): void {
    this.router.navigate(['/learn/course', courseId]);
  }

  viewAllCourses(): void {
    this.router.navigate(['/courses']);
  }

  viewAssignment(assignmentId: number): void {
    this.router.navigate(['/assignments', assignmentId]);
  }

  goToAssignments(): void {
    this.router.navigate(['/assignments']);
  }

  goToGamification(): void {
    this.router.navigate(['/student/gamification']);
  }

  goToLearningPaths(): void {
    this.router.navigate(['/learn/learning-paths']);
  }

  goToCommunication(): void {
    this.router.navigate(['/student/communication']);
  }
}