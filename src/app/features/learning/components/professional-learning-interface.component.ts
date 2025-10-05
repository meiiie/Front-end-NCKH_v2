import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RealVideoPlayerComponent, VideoPlayerConfig } from '../../../shared/components/video-player/real-video-player.component';

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in seconds
  thumbnail: string;
  courseId: string;
  order: number;
  isCompleted: boolean;
  watchedDuration: number;
  lastWatchedAt: Date;
  bookmarks: VideoBookmark[];
  notes: VideoNote[];
}

interface VideoBookmark {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  createdAt: Date;
}

interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  lessons: VideoLesson[];
  progress: number;
  category: string;
  rating: number;
  sectionTitle?: string; // For breadcrumb display
}

@Component({
  selector: 'app-professional-learning-interface',
  imports: [CommonModule, RouterModule, FormsModule, RealVideoPlayerComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Professional Learning Interface -->
      <div class="flex h-screen">
        <!-- Left Navigation Sidebar (20-25%) -->
        <div class="w-1/4 min-w-80 bg-white border-r border-gray-200 flex flex-col">
          <!-- Course Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <img [src]="course().thumbnail" [alt]="course().title"
                   class="w-12 h-12 rounded-lg object-cover">
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-gray-900 truncate">{{ course().title }}</h2>
                <p class="text-sm text-gray-600">{{ course().instructor }}</p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Tiến độ</span>
                <span class="font-medium text-gray-900">{{ course().progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                     [style.width.%]="course().progress"></div>
              </div>
            </div>
          </div>

          <!-- Navigation Search -->
          <div class="p-4 border-b border-gray-200">
            <div class="relative">
              <input type="text"
                     placeholder="Tìm kiếm bài học..."
                     class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     [(ngModel)]="searchQuery"
                     (input)="filterLessons()">
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Lessons Navigation -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4">
              <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4"
                  id="lessons-heading">Danh sách bài học</h3>
              <nav aria-labelledby="lessons-heading" role="navigation">
                <ul class="space-y-2" role="list">
                  @for (lesson of filteredLessons(); track lesson.id; let i = $index) {
                    <li role="listitem">
                      <button (click)="selectLesson(lesson)"
                              [class]="getLessonButtonClass(lesson)"
                              [attr.aria-current]="isCurrentLesson(lesson) ? 'true' : null"
                              [attr.aria-label]="'Bài học ' + (i + 1) + ': ' + lesson.title + (lesson.isCompleted ? ' - Đã hoàn thành' : '')"
                              class="w-full text-left p-3 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <div class="flex items-center space-x-3">
                          <!-- Lesson Number -->
                          <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                               [class]="getLessonNumberClass(lesson)">
                            {{ i + 1 }}
                          </div>

                          <!-- Lesson Info -->
                          <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {{ lesson.title }}
                            </h4>
                            <p class="text-xs text-gray-500">{{ formatDuration(lesson.duration) }}</p>
                          </div>

                          <!-- Status Indicators -->
                          <div class="flex items-center space-x-2">
                            @if (lesson.isCompleted) {
                              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                              </svg>
                            } @else if (lesson.watchedDuration > 0) {
                              <div class="w-5 h-5 border-2 border-blue-600 rounded-full flex items-center justify-center">
                                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                              </div>
                            }
                          </div>
                        </div>
                      </button>
                    </li>
                  }
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <!-- Main Content Area (75-80%) -->
        <div class="flex-1 flex flex-col">
          <!-- Top Navigation Header -->
          <div class="bg-white border-b border-gray-200 px-8 py-4">
            <div class="flex items-center justify-between">
              <!-- Breadcrumb and Title -->
              <div class="flex items-center space-x-4">
                <button (click)="goBack()"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Quay lại">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>

                <div class="flex items-center space-x-2 text-sm text-gray-600">
                  <a [routerLink]="getBreadcrumbLink()" class="hover:text-blue-600 transition-colors">Học tập</a>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium text-gray-900">{{ course().title }}</span>
                  @if (currentLesson()) {
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-blue-600">{{ currentLesson()!.title }}</span>
                  }
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-3">
                <button class="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Thông báo">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h4l4 4v-4h4a2 2 0 002-2z"></path>
                  </svg>
                </button>

                <button class="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Cài đặt">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto">
            @if (currentLesson()) {
              <!-- Lesson Content -->
              <div class="max-w-4xl mx-auto p-8">
                <!-- Lesson Header Banner -->
                <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                  <div class="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div class="relative z-10">
                    <div class="flex items-center space-x-2 text-blue-100 mb-4">
                      <span class="text-sm font-medium">Bài {{ currentLessonIndex() + 1 }}</span>
                      <span class="text-blue-200">•</span>
                      <span class="text-sm">{{ formatDuration(currentLesson()!.duration) }}</span>
                    </div>
                    <h1 class="text-3xl font-bold mb-4">{{ currentLesson()!.title }}</h1>
                    <p class="text-blue-100 text-lg leading-relaxed">{{ currentLesson()!.description }}</p>
                  </div>

                  <!-- Decorative elements -->
                  <div class="absolute top-4 right-4 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                  <div class="absolute bottom-4 left-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                </div>

                <!-- Video Player Section -->
                <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                  <div class="aspect-video">
                    <app-real-video-player
                      [config]="videoPlayerConfig"
                      (stateChange)="onVideoStateChange($event)"
                      (timeUpdate)="onVideoTimeUpdate($event)"
                      (playEvent)="onVideoPlay()"
                      (pauseEvent)="onVideoPause()"
                      (endedEvent)="onVideoEnded()"
                      (errorEvent)="onVideoError($event)">
                    </app-real-video-player>
                  </div>
                </div>

                <!-- Interactive Content Section -->
                <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6">Nội dung bài học</h2>

                  <!-- Example Interactive Content -->
                  <div class="space-y-8">
                    <!-- Text Content -->
                    <div class="prose prose-lg max-w-none">
                      <p class="text-gray-700 leading-relaxed mb-6">
                        Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của an toàn thực phẩm
                        và cách nhận biết các mối nguy hiểm tiềm ẩn trong quá trình chế biến thực phẩm.
                      </p>

                      <h3 class="text-xl font-semibold text-gray-900 mb-4">Các loại mối nguy hiểm thực phẩm</h3>

                      <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <!-- High Risk Food Card -->
                        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                             (click)="showHighRiskInfo()"
                             role="button"
                             tabindex="0"
                             aria-label="Xem thông tin về thực phẩm có nguy cơ cao">
                          <div class="flex items-center space-x-4 mb-4">
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                              </svg>
                            </div>
                            <h4 class="text-lg font-semibold text-red-900">Thực phẩm nguy cơ cao</h4>
                          </div>
                          <p class="text-red-700 mb-4">Các loại thực phẩm dễ bị nhiễm khuẩn và gây ngộ độc thực phẩm.</p>
                          <div class="text-sm text-red-600 font-medium">Nhấp để xem chi tiết →</div>
                        </div>

                        <!-- Low Risk Food Card -->
                        <div class="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                             (click)="showLowRiskInfo()"
                             role="button"
                             tabindex="0"
                             aria-label="Xem thông tin về thực phẩm có nguy cơ thấp">
                          <div class="flex items-center space-x-4 mb-4">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                              </svg>
                            </div>
                            <h4 class="text-lg font-semibold text-green-900">Thực phẩm nguy cơ thấp</h4>
                          </div>
                          <p class="text-green-700 mb-4">Các loại thực phẩm ít có nguy cơ gây ngộ độc thực phẩm.</p>
                          <div class="text-sm text-green-600 font-medium">Nhấp để xem chi tiết →</div>
                        </div>
                      </div>

                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p class="text-blue-800 text-sm italic">
                          <strong>Lưu ý:</strong> Click on the icons to see more information about each food category.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Lesson Actions -->
                <div class="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
                  <button (click)="previousLesson()"
                          [disabled]="isFirstLesson()"
                          class="flex items-center space-x-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Bài trước</span>
                  </button>

                  <div class="flex items-center space-x-4">
                    <button (click)="markAsComplete()"
                            [class]="currentLesson()!.isCompleted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'"
                            class="px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors font-medium">
                      @if (currentLesson()!.isCompleted) {
                        <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        Đã hoàn thành
                      } @else {
                        Đánh dấu hoàn thành
                      }
                    </button>
                  </div>

                  <button (click)="nextLesson()"
                          [disabled]="isLastLesson()"
                          class="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span>Bài tiếp</span>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
            } @else {
              <!-- No Lesson Selected -->
              <div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-4">Chọn bài học để bắt đầu</h3>
                  <p class="text-gray-600 mb-6">Hãy chọn một bài học từ danh sách bên trái để bắt đầu học tập.</p>
                  <button (click)="selectFirstLesson()"
                          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Bắt đầu từ bài đầu tiên
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalLearningInterfaceComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Search and filtering
  searchQuery = signal('');
  filteredLessons = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.course().lessons;

    return this.course().lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(query) ||
      lesson.description.toLowerCase().includes(query)
    );
  });

  // Mock course data - in real app this would come from a service
  course = signal<Course>({
    id: 'course-1',
    title: 'An toàn Thực phẩm - Cơ bản',
    description: 'Khóa học cung cấp kiến thức cơ bản về an toàn thực phẩm',
    instructor: 'ThS. Nguyễn Thị An',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    duration: '6 tuần',
    progress: 75,
    category: 'food-safety',
    rating: 4.7,
    lessons: [
      {
        id: 'lesson-1',
        title: 'Giới thiệu về An toàn Thực phẩm',
        description: 'Tổng quan về tầm quan trọng của an toàn thực phẩm trong ngành dịch vụ ăn uống',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 1800,
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
        courseId: 'course-1',
        order: 1,
        isCompleted: true,
        watchedDuration: 1800,
        lastWatchedAt: new Date(),
        bookmarks: [],
        notes: []
      },
      {
        id: 'lesson-2',
        title: 'High and low risk foods',
        description: 'Understanding different categories of food based on contamination risk',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 2400,
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
        courseId: 'course-1',
        order: 2,
        isCompleted: false,
        watchedDuration: 1200,
        lastWatchedAt: new Date(),
        bookmarks: [
          {
            id: 'bookmark-1',
            timestamp: 300,
            title: 'High risk food definition',
            description: 'Key characteristics of high-risk food items',
            createdAt: new Date()
          }
        ],
        notes: [
          {
            id: 'note-1',
            timestamp: 600,
            content: 'High-risk foods require special attention during storage and preparation',
            createdAt: new Date()
          }
        ]
      },
      {
        id: 'lesson-3',
        title: 'Food Safety Hazards',
        description: 'Identifying and preventing biological, chemical, and physical hazards',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        duration: 2700,
        thumbnail: 'https://images.unsplash.com/photo-1551887196-72e32bfc7f43?w=300&h=200&fit=crop',
        courseId: 'course-1',
        order: 3,
        isCompleted: false,
        watchedDuration: 0,
        lastWatchedAt: new Date(),
        bookmarks: [],
        notes: []
      }
    ]
  });

  currentLesson = signal<VideoLesson | null>(null);
  currentLessonIndex = computed(() => {
    const current = this.currentLesson();
    if (!current) return 0;
    return this.course().lessons.findIndex(lesson => lesson.id === current.id);
  });

  videoPlayerConfig = signal<VideoPlayerConfig>({
    src: '',
    controls: true,
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    volume: 1,
    playbackRate: 1
  });

  ngOnInit(): void {
    // Get course ID from route params
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  loadCourse(courseId: string): void {
    // In real app, this would load from service
    // For now, we'll use mock data
  }

  selectLesson(lesson: VideoLesson): void {
    this.currentLesson.set(lesson);
    this.updateVideoPlayer();
  }

  selectFirstLesson(): void {
    if (this.course().lessons.length > 0) {
      this.selectLesson(this.course().lessons[0]);
    }
  }

  previousLesson(): void {
    const currentIndex = this.currentLessonIndex();
    if (currentIndex > 0) {
      this.selectLesson(this.course().lessons[currentIndex - 1]);
    }
  }

  nextLesson(): void {
    const currentIndex = this.currentLessonIndex();
    if (currentIndex < this.course().lessons.length - 1) {
      this.selectLesson(this.course().lessons[currentIndex + 1]);
    }
  }

  isFirstLesson(): boolean {
    return this.currentLessonIndex() === 0;
  }

  isLastLesson(): boolean {
    return this.currentLessonIndex() === this.course().lessons.length - 1;
  }

  isCurrentLesson(lesson: VideoLesson): boolean {
    const current = this.currentLesson();
    return current ? current.id === lesson.id : false;
  }

  markAsComplete(): void {
    const current = this.currentLesson();
    if (current) {
      // Update lesson completion status
      const lessons = this.course().lessons.map(lesson =>
        lesson.id === current.id ? { ...lesson, isCompleted: true } : lesson
      );

      this.course.update(course => ({
        ...course,
        lessons,
        progress: Math.round((lessons.filter(l => l.isCompleted).length / lessons.length) * 100)
      }));
    }
  }

  updateVideoPlayer(): void {
    const current = this.currentLesson();
    if (current) {
      this.videoPlayerConfig.set({
        ...this.videoPlayerConfig(),
        src: current.videoUrl,
        poster: current.thumbnail
      });
    }
  }

  filterLessons(): void {
    // The computed signal will automatically update
  }

  goBack(): void {
    // Since we're now nested under student routes, always go back to student dashboard
    this.router.navigate(['/student']);
  }

  getBreadcrumbLink(): string[] {
    // Since we're now nested under student routes, always link to student dashboard
    return ['/student'];
  }

  showHighRiskInfo(): void {
    // Show modal or expand section with high-risk food information
    alert('High-risk foods include: meat, poultry, dairy products, seafood, and cooked rice. These foods support bacterial growth and can cause foodborne illness if not handled properly.');
  }

  showLowRiskInfo(): void {
    // Show modal or expand section with low-risk food information
    alert('Low-risk foods include: fresh fruits and vegetables, bread, cereals, and most packaged foods. These foods are less likely to support bacterial growth.');
  }

  getLessonButtonClass(lesson: VideoLesson): string {
    const current = this.currentLesson();
    const isSelected = current && current.id === lesson.id;

    if (isSelected) {
      return 'bg-blue-50 border-2 border-blue-500 text-blue-900 shadow-md';
    } else if (lesson.isCompleted) {
      return 'bg-green-50 border border-green-200 text-green-900 hover:bg-green-100';
    } else if (lesson.watchedDuration > 0) {
      return 'bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100';
    } else {
      return 'bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100';
    }
  }

  getLessonNumberClass(lesson: VideoLesson): string {
    const current = this.currentLesson();
    const isSelected = current && current.id === lesson.id;

    if (isSelected) {
      return 'bg-blue-600 text-white';
    } else if (lesson.isCompleted) {
      return 'bg-green-600 text-white';
    } else if (lesson.watchedDuration > 0) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-200 text-gray-600';
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Video player event handlers
  onVideoStateChange(state: any): void {
    console.log('Video state changed:', state);
  }

  onVideoTimeUpdate(time: number): void {
    console.log('Video time update:', time);
  }

  onVideoPlay(): void {
    console.log('Video started playing');
  }

  onVideoPause(): void {
    console.log('Video paused');
  }

  onVideoEnded(): void {
    console.log('Video ended');
    this.markAsComplete();
  }

  onVideoError(error: any): void {
    console.error('Video error:', error);
  }
}