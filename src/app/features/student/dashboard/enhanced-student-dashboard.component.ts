import { Component, signal, computed, inject, effect, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../state/course.service';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import {
  EnrolledCourse,
  Assignment,
  Achievement
} from '../types';
import { DashboardHeroComponent } from './dashboard-hero.component';
import { DashboardQuickActionsComponent } from './dashboard-quick-actions.component';
import { DashboardContinueLearningComponent } from './dashboard-continue-learning.component';
import { DashboardAssignmentsComponent } from './dashboard-assignments.component';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

@Component({
  selector: 'app-enhanced-student-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    LoadingComponent,
    DashboardHeroComponent,
    DashboardQuickActionsComponent,
    DashboardContinueLearningComponent,
    DashboardAssignmentsComponent,
    DashboardSidebarComponent
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Loading State -->
    <app-loading
      *ngIf="isLoading()"
      text="Đang tải dashboard..."
      subtext="Vui lòng chờ trong giây lát"
      variant="overlay"
      color="blue">
    </app-loading>

    <div class="min-h-screen bg-gray-50">

      <!-- Hero Section -->
      <app-dashboard-hero
        [userName]="authService.userName()"
        [currentStreak]="currentStreak()"
        [currentLevel]="currentLevel()"
        [achievementsCount]="achievementsCount()"
        [enrolledCoursesCount]="enrolledCoursesCount()"
        [completedCoursesCount]="completedCoursesCount()"
        [totalStudyTime]="totalStudyTime()"
        [averageGrade]="averageGrade()">
      </app-dashboard-hero>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Quick Actions -->
        <app-dashboard-quick-actions
          (continueLearning)="goToLearning()"
          (goToQuiz)="goToQuiz()"
          (goToCourses)="goToCourses()">
        </app-dashboard-quick-actions>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column - Current Learning -->
          <div class="lg:col-span-2 space-y-6">
            <app-dashboard-continue-learning
              [enrolledCourses]="enrolledCourses()"
              (continueLearning)="continueLearning($event)"
              (goToLearning)="goToLearning()">
            </app-dashboard-continue-learning>

            <app-dashboard-assignments
              [pendingAssignments]="pendingAssignments()"
              (goToAssignments)="goToAssignments()">
            </app-dashboard-assignments>
          </div>

          <!-- Right Column - Sidebar -->
          <app-dashboard-sidebar
            [enrolledCourses]="enrolledCourses()"
            [achievements]="achievements()">
          </app-dashboard-sidebar>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedStudentDashboardComponent {
  protected authService = inject(AuthService);
  protected courseService = inject(CourseService);
  private router = inject(Router);
  private errorService = inject(ErrorHandlingService);

  // Loading states
  isLoading = signal<boolean>(true);

  // Mock data for enrolled courses
  enrolledCourses = signal<EnrolledCourse[]>([
    {
      id: 'course-1',
      title: 'Kỹ thuật Tàu biển Cơ bản',
      description: 'Khóa học cung cấp kiến thức cơ bản về kỹ thuật tàu biển',
      instructor: 'ThS. Nguyễn Văn Hải',
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      duration: '8 tuần',
      deadline: '2024-12-31',
      status: 'in-progress',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
      category: 'engineering',
      rating: 4.7,
      lastAccessed: new Date()
    },
    {
      id: 'course-2',
      title: 'An toàn Hàng hải',
      description: 'Các quy định và thực hành an toàn trong ngành hàng hải',
      instructor: 'TS. Trần Thị Lan',
      progress: 45,
      totalLessons: 10,
      completedLessons: 4,
      duration: '6 tuần',
      deadline: '2024-11-30',
      status: 'in-progress',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-14b1e3d71e51?w=300&h=200&fit=crop',
      category: 'safety',
      rating: 4.8,
      lastAccessed: new Date()
    },
    {
      id: 'course-3',
      title: 'Quản lý Cảng biển',
      description: 'Kiến thức về quản lý và vận hành cảng biển',
      instructor: 'ThS. Lê Văn Minh',
      progress: 100,
      totalLessons: 8,
      completedLessons: 8,
      duration: '4 tuần',
      deadline: '2024-10-15',
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop',
      category: 'logistics',
      rating: 4.6,
      lastAccessed: new Date()
    }
  ]);

  pendingAssignments = signal<Assignment[]>([
    {
      id: 'assignment-1',
      title: 'Bài tập về Cấu trúc Tàu',
      description: 'Phân tích cấu trúc tàu container',
      course: 'Kỹ thuật Tàu biển Cơ bản',
      dueDate: '2024-09-15',
      type: 'assignment',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'assignment-2',
      title: 'Quiz An toàn Hàng hải',
      description: 'Kiểm tra kiến thức về quy định an toàn',
      course: 'An toàn Hàng hải',
      dueDate: '2024-09-20',
      type: 'quiz',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 'assignment-3',
      title: 'Dự án Quản lý Cảng',
      description: 'Thiết kế hệ thống quản lý cảng',
      course: 'Quản lý Cảng biển',
      dueDate: '2024-09-25',
      type: 'project',
      status: 'pending',
      priority: 'low'
    }
  ]);


  achievements = signal<Achievement[]>([
    {
      id: 'achievement-1',
      title: 'Học viên chăm chỉ',
      description: 'Học liên tiếp 7 ngày',
      icon: '🔥',
      earnedAt: new Date('2024-09-10'),
      category: 'streak'
    },
    {
      id: 'achievement-2',
      title: 'Quiz Master',
      description: 'Đạt điểm cao trong 5 quiz liên tiếp',
      icon: '🏆',
      earnedAt: new Date('2024-09-08'),
      category: 'quiz'
    },
    {
      id: 'achievement-3',
      title: 'Course Completer',
      description: 'Hoàn thành khóa học đầu tiên',
      icon: '🎓',
      earnedAt: new Date('2024-09-05'),
      category: 'course'
    }
  ]);

  // Computed values
  completedCourses = computed(() => 
    this.enrolledCourses().filter(course => course.status === 'completed')
  );

  averageGrade = computed(() => {
    // Mock average grade calculation
    return 8.5;
  });

  totalStudyTime = computed(() => {
    // Mock total study time calculation
    return 45;
  });

  currentStreak = computed(() => {
    // Mock current streak calculation
    return 7;
  });

  currentLevel = computed(() => {
    // Mock current level calculation
    return 3;
  });

  constructor() {
    // Initialize dashboard data when component is created
    effect(() => {
      if (!this.isLoading()) {
        this.loadDashboardData();
      }
    });
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Simulate loading data
      await this.simulateDataLoading();
      
      console.log('🔧 Enhanced Student Dashboard - Component initialized');
      console.log('🔧 Enhanced Student Dashboard - User:', this.authService.userName());
      console.log('🔧 Enhanced Student Dashboard - Enrolled courses:', this.enrolledCourses().length);
      
      this.errorService.showSuccess('Dashboard đã được tải thành công!', 'dashboard');
      
    } catch (error) {
      this.errorService.handleApiError(error, 'dashboard');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async simulateDataLoading(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Navigation methods
  continueLearning(courseId: string): void {
    this.router.navigate(['/student/learn/course', courseId]).catch(error => {
      this.errorService.handleNavigationError(error, `/student/learn/course/${courseId}`);
    });
  }

  viewCourseDetail(courseId: string): void {
    this.router.navigate(['/courses', courseId]).catch(error => {
      this.errorService.handleNavigationError(error, `/courses/${courseId}`);
    });
  }

  viewAssignment(): void {
    this.router.navigate(['/student/assignments']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/assignments');
    });
  }

  goToCourses(): void {
    this.router.navigate(['/student/courses']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/courses');
    });
  }

  goToLearning(): void {
    this.router.navigate(['/student/learn']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/learn');
    });
  }

  goToQuiz(): void {
    this.router.navigate(['/student/quiz']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/quiz');
    });
  }

  goToAssignments(): void {
    this.router.navigate(['/student/assignments']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/assignments');
    });
  }

  goToAnalytics(): void {
    this.router.navigate(['/student/analytics']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/analytics');
    });
  }

  goToAchievements(): void {
    this.router.navigate(['/student/profile']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/profile');
    });
  }

  // Computed properties for dashboard components
  achievementsCount = computed(() => this.achievements().length);
  enrolledCoursesCount = computed(() => this.enrolledCourses().length);
  completedCoursesCount = computed(() => this.completedCourses().length);

  // Helper methods
  getAssignmentIconClass(type: string): string {
    switch (type) {
      case 'quiz':
        return 'bg-blue-100 text-blue-600';
      case 'assignment':
        return 'bg-green-100 text-green-600';
      case 'project':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Khẩn cấp';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Không xác định';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Chờ làm';
      case 'submitted':
        return 'Đã nộp';
      case 'graded':
        return 'Đã chấm';
      default:
        return 'Không xác định';
    }
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('vi-VN');
  }
}