import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
import { environment } from '../../../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class CourseManagementService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private errorService = inject(ErrorHandlingService);

  // API Configuration
  private readonly API_BASE_URL = `${environment.apiUrl}/api/v1`;
  private readonly ENDPOINTS = {
    courses: '/courses'
  };

  // Signals for reactive state management
  private _courses = signal<AdminCourse[]>([]);
  private _isLoading = signal<boolean>(false);

  // Readonly signals for external consumption
  readonly courses = this._courses.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Computed signals
  readonly pendingCourses = computed(() =>
    this._courses().filter(course => course.status === 'pending').length
  );

  readonly approvedCourses = computed(() =>
    this._courses().filter(course => course.status === 'approved').length
  );

  readonly totalCourses = computed(() => this._courses().length);

  readonly totalRevenue = computed(() =>
    this._courses().reduce((sum, course) => sum + course.revenue, 0)
  );

  // Course Management Methods
  async getCourses(): Promise<AdminCourse[]> {
    this._isLoading.set(true);
    try {
      // For now, return mock data since backend might not be ready
      // In production, this would call the actual API
      await this.simulateApiCall();
      return this._courses();
    } finally {
      this._isLoading.set(false);
    }
  }

  async approveCourse(courseId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
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
      // In production, this would call the actual API
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

  async createCourse(courseData: Partial<AdminCourse>): Promise<AdminCourse> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
      await this.simulateApiCall();

      const newCourse: AdminCourse = {
        id: this.generateId(),
        title: courseData.title || '',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || '',
        category: courseData.category || 'general',
        level: courseData.level || 'beginner',
        duration: courseData.duration || '0 giờ',
        price: courseData.price || 0,
        thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
        status: 'pending',
        instructor: courseData.instructor || {
          id: 'unknown',
          name: 'Unknown Instructor',
          email: 'unknown@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Unknown&background=8b5cf6&color=ffffff&size=150'
        },
        students: 0,
        rating: 0,
        revenue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        certificate: courseData.certificate || {
          type: 'Completion',
          description: 'Chứng chỉ hoàn thành khóa học'
        }
      };

      this._courses.update(courses => [...courses, newCourse]);
      this.errorService.showSuccess('Khóa học đã được tạo thành công!', 'course');

      return newCourse;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateCourse(courseId: string, updates: Partial<AdminCourse>): Promise<AdminCourse> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
      await this.simulateApiCall();

      let updatedCourse: AdminCourse | undefined;

      this._courses.update(courses =>
        courses.map(course => {
          if (course.id === courseId) {
            updatedCourse = { ...course, ...updates, updatedAt: new Date() };
            return updatedCourse;
          }
          return course;
        })
      );

      if (updatedCourse) {
        this.errorService.showSuccess('Khóa học đã được cập nhật thành công!', 'course');
        return updatedCourse;
      } else {
        throw new Error('Course not found');
      }
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      // In production, this would call the actual API
      await this.simulateApiCall();

      this._courses.update(courses => courses.filter(course => course.id !== courseId));
      this.errorService.showSuccess('Khóa học đã được xóa thành công!', 'course');
    } finally {
      this._isLoading.set(false);
    }
  }

  // Statistics Methods
  getCoursesByStatus(status: string): AdminCourse[] {
    return this._courses().filter(course => course.status === status);
  }

  getCoursesByCategory(category: string): AdminCourse[] {
    return this._courses().filter(course => course.category === category);
  }

  getCoursesByInstructor(instructorId: string): AdminCourse[] {
    return this._courses().filter(course => course.instructor.id === instructorId);
  }

  getTopRatedCourses(limit: number = 10): AdminCourse[] {
    return this._courses()
      .filter(course => course.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  getMostPopularCourses(limit: number = 10): AdminCourse[] {
    return this._courses()
      .sort((a, b) => b.students - a.students)
      .slice(0, limit);
  }

  getRevenueByCategory(): { [category: string]: number } {
    const revenueByCategory: { [category: string]: number } = {};

    this._courses().forEach(course => {
      if (!revenueByCategory[course.category]) {
        revenueByCategory[course.category] = 0;
      }
      revenueByCategory[course.category] += course.revenue;
    });

    return revenueByCategory;
  }

  // Helper Methods
  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateId(): string {
    return 'course_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize with mock data (remove in production)
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockCourses: AdminCourse[] = [
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

    this._courses.set(mockCourses);
  }
}