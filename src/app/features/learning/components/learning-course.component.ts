import { Component, signal, inject, computed, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VideoPlayerService, VideoLesson } from '../services/video-player.service';
import { VideoPlayerComponent } from './video-player.component';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: number;
  lessons: VideoLesson[];
  progress: number;
  isEnrolled: boolean;
}

@Component({
  selector: 'app-learning-course',
  imports: [CommonModule, RouterModule, VideoPlayerComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Course Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex items-start space-x-6">
            <img [src]="course().thumbnail" [alt]="course().title" class="w-32 h-24 rounded-lg object-cover">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ course().title }}</h1>
              <p class="text-gray-600 mb-4">{{ course().description }}</p>
              <div class="flex items-center space-x-6 text-sm text-gray-500">
                <span>Giảng viên: {{ course().instructor }}</span>
                <span>{{ course().duration }} phút</span>
                <span>{{ course().lessons.length }} bài học</span>
              </div>
              
              <!-- Progress Bar -->
              <div class="mt-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tiến độ khóa học</span>
                  <span>{{ course().progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" [style.width.%]="course().progress"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-6">
          <!-- Video Player (8 columns) -->
          <div class="col-span-12 lg:col-span-8">
            @if (currentLesson()) {
              <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ currentLesson()!.title }}</h2>
                <p class="text-gray-600 mb-6">{{ currentLesson()!.description }}</p>
                
                <!-- Video Player -->
                <app-video-player></app-video-player>
                
                <!-- Lesson Actions -->
                <div class="flex items-center justify-between mt-6">
                  <div class="flex items-center space-x-4">
                    <button 
                      (click)="previousLesson()"
                      [disabled]="isFirstLesson()"
                      class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Bài trước
                    </button>
                    
                    <button 
                      (click)="nextLesson()"
                      [disabled]="isLastLesson()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      Bài tiếp
                      <svg class="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button 
                      (click)="toggleBookmark()"
                      class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                      <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                      </svg>
                      Bookmark
                    </button>
                    
                    <button 
                      (click)="toggleNotes()"
                      class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Ghi chú
                    </button>
                  </div>
                </div>
              </div>
            } @else {
              <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Chọn bài học để bắt đầu</h3>
                <p class="text-gray-600">Hãy chọn một bài học từ danh sách bên phải để bắt đầu học tập.</p>
              </div>
            }
          </div>

          <!-- Course Sidebar (4 columns) -->
          <div class="col-span-12 lg:col-span-4">
            <!-- Course Progress -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Tiến độ khóa học</h3>
              <div class="space-y-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tổng bài học:</span>
                  <span class="font-medium">{{ course().lessons.length }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Đã hoàn thành:</span>
                  <span class="font-medium text-green-600">{{ completedLessons() }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Còn lại:</span>
                  <span class="font-medium text-orange-600">{{ remainingLessons() }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="course().progress"></div>
                </div>
              </div>
            </div>

            <!-- Course Lessons -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Danh sách bài học</h3>
              <div class="space-y-2">
                @for (lesson of course().lessons; track lesson.id; let i = $index) {
                  <div 
                    class="p-4 rounded-lg cursor-pointer transition-colors"
                    [class]="getLessonClass(lesson)"
                    (click)="selectLesson(lesson)">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                             [class]="getLessonNumberClass(lesson)">
                          {{ i + 1 }}
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">{{ lesson.title }}</h4>
                          <p class="text-sm text-gray-500">{{ formatDuration(lesson.duration) }}</p>
                        </div>
                      </div>
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
                        
                        @if (lesson.bookmarks.length > 0) {
                          <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                          </svg>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningCourseComponent {
  protected videoPlayerService = inject(VideoPlayerService);

  // Mock course data
  course = signal<Course>({
    id: 'course-1',
    title: 'Kỹ thuật Tàu biển Cơ bản',
    description: 'Khóa học cung cấp kiến thức cơ bản về kỹ thuật tàu biển, bao gồm cấu trúc tàu, hệ thống động lực, và quy trình vận hành.',
    instructor: 'ThS. Nguyễn Văn Hải',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    duration: 180, // 3 hours
    progress: 65,
    isEnrolled: true,
    lessons: [
      {
        id: 'lesson-1',
        title: 'Giới thiệu về Tàu biển',
        description: 'Tổng quan về lịch sử và phát triển của ngành hàng hải',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 1200, // 20 minutes
        thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
        courseId: 'course-1',
        order: 1,
        isCompleted: true,
        watchedDuration: 1200,
        lastWatchedAt: new Date(),
        bookmarks: []
      },
      {
        id: 'lesson-2',
        title: 'Cấu trúc Tàu biển',
        description: 'Phân tích chi tiết các thành phần cấu trúc của tàu biển',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 1800, // 30 minutes
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-14b1e3d71e51?w=300&h=200&fit=crop',
        courseId: 'course-1',
        order: 2,
        isCompleted: false,
        watchedDuration: 900,
        lastWatchedAt: new Date(),
        bookmarks: [
          {
            id: 'bookmark-1',
            timestamp: 300,
            title: 'Cấu trúc thân tàu',
            description: 'Phần quan trọng về cấu trúc thân tàu',
            createdAt: new Date()
          }
        ]
      },
      {
        id: 'lesson-3',
        title: 'Hệ thống Động lực',
        description: 'Tìm hiểu về các hệ thống động lực trên tàu biển',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        duration: 2400, // 40 minutes
        thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop',
        courseId: 'course-1',
        order: 3,
        isCompleted: false,
        watchedDuration: 0,
        bookmarks: []
      }
    ]
  });

  currentLesson = signal<VideoLesson | null>(null);

  completedLessons = computed(() => 
    this.course().lessons.filter(lesson => lesson.isCompleted).length
  );

  remainingLessons = computed(() => 
    this.course().lessons.length - this.completedLessons()
  );

  selectLesson(lesson: VideoLesson): void {
    this.currentLesson.set(lesson);
    this.videoPlayerService.loadVideo(lesson);
  }

  previousLesson(): void {
    const current = this.currentLesson();
    if (!current) return;

    const currentIndex = this.course().lessons.findIndex(l => l.id === current.id);
    if (currentIndex > 0) {
      const previousLesson = this.course().lessons[currentIndex - 1];
      this.selectLesson(previousLesson);
    }
  }

  nextLesson(): void {
    const current = this.currentLesson();
    if (!current) return;

    const currentIndex = this.course().lessons.findIndex(l => l.id === current.id);
    if (currentIndex < this.course().lessons.length - 1) {
      const nextLesson = this.course().lessons[currentIndex + 1];
      this.selectLesson(nextLesson);
    }
  }

  isFirstLesson(): boolean {
    const current = this.currentLesson();
    if (!current) return true;
    return this.course().lessons[0].id === current.id;
  }

  isLastLesson(): boolean {
    const current = this.currentLesson();
    if (!current) return true;
    const lastLesson = this.course().lessons[this.course().lessons.length - 1];
    return lastLesson.id === current.id;
  }

  getLessonClass(lesson: VideoLesson): string {
    const current = this.currentLesson();
    if (current && current.id === lesson.id) {
      return 'bg-blue-50 border-2 border-blue-200';
    } else if (lesson.isCompleted) {
      return 'bg-green-50 hover:bg-green-100';
    } else if (lesson.watchedDuration > 0) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    } else {
      return 'bg-gray-50 hover:bg-gray-100';
    }
  }

  getLessonNumberClass(lesson: VideoLesson): string {
    const current = this.currentLesson();
    if (current && current.id === lesson.id) {
      return 'bg-blue-600 text-white';
    } else if (lesson.isCompleted) {
      return 'bg-green-600 text-white';
    } else if (lesson.watchedDuration > 0) {
      return 'bg-yellow-600 text-white';
    } else {
      return 'bg-gray-300 text-gray-700';
    }
  }

  toggleBookmark(): void {
    // This would open a bookmark modal or add bookmark
    console.log('Toggle bookmark');
  }

  toggleNotes(): void {
    // This would open a notes panel
    console.log('Toggle notes');
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} phút`;
  }
}
