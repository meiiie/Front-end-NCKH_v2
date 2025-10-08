import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParallaxBackgroundComponent } from '../../shared/components/parallax-background/parallax-background.component';

@Component({
  selector: 'app-home-simple',
  imports: [CommonModule, RouterModule, ParallaxBackgroundComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Parallax Hero Section -->
    <app-parallax-background></app-parallax-background>

    <!-- Stats Section -->
    <section class="py-16 bg-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div class="text-gray-600">Khóa học chuyên nghiệp</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">2.500+</div>
            <div class="text-gray-600">Học viên tin tưởng</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">25+</div>
            <div class="text-gray-600">Chuyên gia giảng dạy</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">1.200+</div>
            <div class="text-gray-600">Chứng chỉ đã cấp</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn LMS Maritime?</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Nền tảng học tập được thiết kế đặc biệt cho ngành hàng hải với các tính năng vượt trội
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Nội dung chuyên nghiệp</h3>
            <p class="text-gray-600 leading-relaxed">
              Khóa học được thiết kế bởi các chuyên gia hàng hải có kinh nghiệm thực tế và được cập nhật liên tục
            </p>
          </div>

          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Học mọi lúc mọi nơi</h3>
            <p class="text-gray-600 leading-relaxed">
              Truy cập khóa học 24/7 trên mọi thiết bị, học tập linh hoạt theo lịch trình và tốc độ của bạn
            </p>
          </div>

          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Chứng chỉ uy tín</h3>
            <p class="text-gray-600 leading-relaxed">
              Nhận chứng chỉ được công nhận bởi Trường Đại học Hàng hải Việt Nam và các tổ chức quốc tế
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSimpleComponent {
  constructor() {
    // Component initialized
  }
}