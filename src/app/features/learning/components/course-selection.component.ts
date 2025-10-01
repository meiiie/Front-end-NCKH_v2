import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  studentsCount: number;
  price: number;
  isEnrolled: boolean;
  progress: number;
  status: 'enrolled' | 'in-progress' | 'completed';
  lastAccessed?: Date;
}

@Component({
  selector: 'app-course-selection',
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  template: `
    <!-- Loading State -->
    <app-loading 
      [show]="isLoading()" 
      text="Đang tải khóa học..."
      subtext="Vui lòng chờ trong giây lát"
      variant="overlay"
      color="blue">
    </app-loading>

    <div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">📚 Chọn khóa học</h1>
            <p class="text-gray-600">Khám phá và đăng ký các khóa học hàng hải phù hợp với bạn</p>
          </div>
          <div class="flex items-center space-x-4">
            <button (click)="goBack()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path>
              </svg>
              Quay lại
            </button>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
                       placeholder="Tìm kiếm khóa học..."
                       class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                </svg>
              </div>
              
              <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()"
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tất cả danh mục</option>
                <option value="safety">An toàn hàng hải</option>
                <option value="navigation">Điều khiển tàu</option>
                <option value="engineering">Kỹ thuật tàu biển</option>
                <option value="logistics">Quản lý cảng</option>
                <option value="law">Luật hàng hải</option>
                <option value="certificates">Chứng chỉ</option>
              </select>
              
              <select [(ngModel)]="selectedLevel" (ngModelChange)="onFilterChange()"
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            
            <div class="flex items-center space-x-4">
              <select [(ngModel)]="sortBy" (ngModelChange)="onSortChange()"
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="rating">Đánh giá cao nhất</option>
                <option value="students">Nhiều học viên</option>
                <option value="price">Giá thấp nhất</option>
                <option value="title">Tên A-Z</option>
              </select>
              
              <button (click)="refreshCourses()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 11.885-.666z" clip-rule="evenodd"></path>
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        <!-- Courses Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (course of filteredCourses(); track course.id) {
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <!-- Course Image -->
              <div class="relative">
                <img [src]="course.thumbnail" [alt]="course.title" 
                     class="w-full h-48 object-cover">
                <div class="absolute top-4 right-4">
                  <span class="px-3 py-1 bg-white bg-opacity-90 rounded-full text-sm font-medium"
                        [class]="getStatusClass(course.status)">
                    {{ getStatusText(course.status) }}
                  </span>
                </div>
                <div class="absolute top-4 left-4">
                  <span class="px-3 py-1 bg-white bg-opacity-90 rounded-full text-sm font-medium"
                        [class]="getDifficultyClass(course.level)">
                    {{ getDifficultyText(course.level) }}
                  </span>
                </div>
              </div>

              <!-- Course Content -->
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ course.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ course.description }}</p>
                
                <!-- Course Info -->
                <div class="space-y-3 mb-4">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                    </svg>
                    {{ course.instructor }}
                  </div>
                  
                  <div class="flex items-center justify-between text-sm text-gray-600">
                    <div class="flex items-center space-x-4">
                      <span>{{ course.duration }}</span>
                      <span>{{ course.studentsCount }} học viên</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span>{{ course.rating }}</span>
                    </div>
                  </div>
                  
                  @if (course.isEnrolled && course.progress > 0) {
                    <div class="space-y-2">
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>Tiến độ</span>
                        <span>{{ course.progress }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                             [style.width.%]="course.progress"></div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Actions -->
                <div class="space-y-3">
                  @if (course.isEnrolled) {
                    <button (click)="continueCourse(course.id)"
                            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                      </svg>
                      Tiếp tục học
                    </button>
                  } @else {
                    <button (click)="enrollCourse(course.id)"
                            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                      </svg>
                      Đăng ký học
                    </button>
                  }
                  
                  <div class="flex space-x-2">
                    <button (click)="viewCourseDetail(course.id)"
                            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                      </svg>
                      Chi tiết
                    </button>
                    
                    @if (course.isEnrolled) {
                      <button (click)="reviewCourse(course.id)"
                              class="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm">
                        <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        Đánh giá
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Empty State -->
        @if (filteredCourses().length === 0) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khóa học</h3>
            <p class="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button (click)="clearFilters()"
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Xóa bộ lọc
            </button>
          </div>
        }

        <!-- Pagination -->
        @if (filteredCourses().length > 0) {
          <div class="flex items-center justify-between mt-8">
            <div class="text-sm text-gray-600">
              Hiển thị {{ (currentPage() - 1) * itemsPerPage + 1 }} - {{ getMinValue(currentPage() * itemsPerPage, filteredCourses().length) }} 
              trong {{ filteredCourses().length }} khóa học
            </div>
            
            <div class="flex items-center space-x-2">
              <button (click)="previousPage()" 
                      [disabled]="currentPage() === 1"
                      class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </button>
              
              <span class="px-3 py-2 text-sm text-gray-700">
                Trang {{ currentPage() }} / {{ totalPages() }}
              </span>
              
              <button (click)="nextPage()" 
                      [disabled]="currentPage() === totalPages()"
                      class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseSelectionComponent implements OnInit {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private errorService = inject(ErrorHandlingService);

  // Signals
  isLoading = signal<boolean>(true);
  courses = signal<Course[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = 12;

  // Filter properties
  searchQuery = '';
  selectedCategory = '';
  selectedLevel = '';
  sortBy = 'rating';

  // Mock data
  ngOnInit(): void {
    this.loadCourses();
  }

  private async loadCourses(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Simulate loading delay
      await this.simulateDataLoading();
      
      // Mock courses data
      const mockCourses: Course[] = [
        {
          id: 1,
          title: 'Kỹ thuật Tàu biển Cơ bản',
          description: 'Khóa học cung cấp kiến thức cơ bản về kỹ thuật tàu biển, bao gồm cấu trúc tàu, hệ thống động lực, và quy trình vận hành.',
          instructor: 'ThS. Nguyễn Văn Hải',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
          duration: '40 giờ',
          level: 'beginner',
          category: 'engineering',
          rating: 4.8,
          studentsCount: 156,
          price: 1500000,
          isEnrolled: true,
          progress: 75,
          status: 'in-progress',
          lastAccessed: new Date()
        },
        {
          id: 2,
          title: 'An toàn Hàng hải',
          description: 'Các quy định và thực hành an toàn trong ngành hàng hải, bao gồm quy trình an toàn, thiết bị cứu sinh, và xử lý tình huống khẩn cấp.',
          instructor: 'TS. Trần Thị Lan',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-14b1e3d71e51?w=400&h=300&fit=crop',
          duration: '30 giờ',
          level: 'intermediate',
          category: 'safety',
          rating: 4.6,
          studentsCount: 134,
          price: 1200000,
          isEnrolled: true,
          progress: 100,
          status: 'completed',
          lastAccessed: new Date()
        },
        {
          id: 3,
          title: 'Quản lý Cảng biển',
          description: 'Kiến thức về quản lý và vận hành cảng biển, bao gồm quy trình logistics, quản lý container, và an toàn cảng.',
          instructor: 'ThS. Lê Văn Minh',
          thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop',
          duration: '35 giờ',
          level: 'beginner',
          category: 'logistics',
          rating: 4.5,
          studentsCount: 98,
          price: 1800000,
          isEnrolled: false,
          progress: 0,
          status: 'enrolled'
        }
      ];
      
      this.courses.set(mockCourses);
      
      console.log('🔧 Course Selection - Component initialized');
      console.log('🔧 Course Selection - Courses count:', this.courses().length);
      
      this.errorService.showSuccess('Danh sách khóa học đã được tải thành công!', 'courses');
      
    } catch (error) {
      this.errorService.handleApiError(error, 'courses');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async simulateDataLoading(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Computed properties
  filteredCourses = computed(() => {
    let courses = [...this.courses()];
    
    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (this.selectedCategory) {
      courses = courses.filter(course => course.category === this.selectedCategory);
    }
    
    // Level filter
    if (this.selectedLevel) {
      courses = courses.filter(course => course.level === this.selectedLevel);
    }
    
    // Sort
    courses.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'students':
          return b.studentsCount - a.studentsCount;
        case 'price':
          return a.price - b.price;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return courses;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCourses().length / this.itemsPerPage);
  });

  // Methods
  goBack(): void {
    this.router.navigate(['/student/learning']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/learning');
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  onSortChange(): void {
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedLevel = '';
    this.sortBy = 'rating';
    this.currentPage.set(1);
  }

  refreshCourses(): void {
    // Simulate refresh
    console.log('Refreshing courses...');
  }

  continueCourse(courseId: number): void {
    this.router.navigate(['/learn/course', courseId]);
  }

  reviewCourse(courseId: number): void {
    this.router.navigate(['/learn', courseId, 'review']);
  }

  viewCourseDetail(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  enrollCourse(courseId: number): void {
    console.log('Enrolling in course:', courseId);
    this.errorService.showSuccess('Đã đăng ký khóa học thành công!', 'enrollment');
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'enrolled': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'enrolled': 'Đã đăng ký',
      'in-progress': 'Đang học',
      'completed': 'Hoàn thành'
    };
    return statusTexts[status] || status;
  }

  getDifficultyClass(difficulty: string): string {
    const difficultyClasses: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return difficultyClasses[difficulty] || 'bg-gray-100 text-gray-800';
  }

  getDifficultyText(difficulty: string): string {
    const difficultyTexts: { [key: string]: string } = {
      'beginner': 'Cơ bản',
      'intermediate': 'Trung bình',
      'advanced': 'Nâng cao'
    };
    return difficultyTexts[difficulty] || difficulty;
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}