import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LEVEL_LABELS, CourseLevel, ExtendedCourse } from '../../../shared/types/course.types';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow" [attr.aria-label]="'Khóa học: ' + course.title">
      <div class="relative">
        <img [ngSrc]="course.thumbnail" width="800" height="320" [alt]="'Hình ảnh khóa học ' + course.title" class="w-full h-48 object-cover" />
        <div class="absolute top-3 left-3 flex gap-2" role="group" aria-label="Nhãn khóa học">
          <span *ngIf="course.isPopular" class="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold" aria-label="Khóa học phổ biến">Phổ biến</span>
          <span *ngIf="course.isNew" class="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold" aria-label="Khóa học mới">Mới</span>
        </div>
      </div>

      <div class="p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded" [attr.aria-label]="'Danh mục: ' + getCategoryName(course.category)">
            {{ getCategoryName(course.category) }}
          </span>
          <span class="text-sm text-gray-500" [attr.aria-label]="'Cấp độ: ' + levelLabel(course.level)">{{ levelLabel(course.level) }}</span>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{{ course.title }}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ course.description }}</p>

        <div class="flex items-center mb-4" role="group" [attr.aria-label]="'Thông tin giảng viên'">
          <img [ngSrc]="course.instructor.avatar" width="64" height="64" [alt]="'Ảnh đại diện giảng viên ' + course.instructor.name" class="w-8 h-8 rounded-full mr-3" />
          <div>
            <p class="text-sm font-medium text-gray-900">{{ course.instructor.name }}</p>
            <p class="text-xs text-gray-500">{{ course.instructor.title }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between mb-4" role="group" aria-label="Thông tin đánh giá và nội dung">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="text-sm font-medium text-gray-900" [attr.aria-label]="'Đánh giá ' + course.rating + ' sao'">{{ course.rating }}</span>
            <span class="text-sm text-gray-500 ml-1" [attr.aria-label]="'Số học viên: ' + course.studentsCount">({{ course.studentsCount }})</span>
          </div>
          <div class="text-sm text-gray-500" [attr.aria-label]="'Số bài học: ' + course.lessonsCount">{{ course.lessonsCount }} bài học</div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-lg font-bold text-gray-900" [attr.aria-label]="'Giá khóa học: ' + (course.price === 0 ? 'Miễn phí' : (course.price | currency:'VND':'symbol':'1.0-0':'vi'))">
            {{ course.price === 0 ? 'Miễn phí' : (course.price | currency:'VND':'symbol':'1.0-0':'vi') }}
          </div>
          <a [routerLink]="['/courses', course.id]" 
             [attr.aria-label]="'Xem chi tiết khóa học ' + course.title"
             class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Xem chi tiết
          </a>
        </div>
      </div>
    </article>
  `
})
export class CourseCardComponent {
  @Input() course!: ExtendedCourse;

  levelLabel(level: CourseLevel): string {
    return LEVEL_LABELS[level] ?? level;
  }

  getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      'engineering': 'Kỹ thuật tàu biển',
      'logistics': 'Quản lý cảng',
      'safety': 'An toàn hàng hải',
      'navigation': 'Hàng hải',
      'law': 'Luật hàng hải'
    };
    return categoryNames[category] || category;
  }
}


