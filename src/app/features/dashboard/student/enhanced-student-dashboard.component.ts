import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../state/course.service';
import { ResponsiveService } from '../../../shared/services/responsive.service';
import { ErrorHandlingService } from '../../../shared/services/error-handling.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface EnrolledCourse {
  id: string;
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
  category: string;
  rating: number;
  lastAccessed: Date;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  type: 'quiz' | 'assignment' | 'project';
  status: 'pending' | 'submitted' | 'graded';
  priority: 'low' | 'medium' | 'high';
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'course' | 'quiz' | 'streak' | 'social';
}

@Component({
  selector: 'app-enhanced-student-dashboard',
  imports: [CommonModule, RouterModule, LoadingComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Loading State -->
    <app-loading 
      [show]="isLoading()" 
      text="Đang tải dashboard..."
      subtext="Vui lòng chờ trong giây lát"
      variant="overlay"
      color="blue">
    </app-loading>

    <div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <!-- Enhanced Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 20 Q25 0 50 20 T100 20 V0 H0 Z" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#waves)"/>
          </svg>
        </div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <div class="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.285.985.985 0 00.15-.76V9.397zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl font-bold mb-2">Chào mừng trở lại, {{ authService.userName() }}!</h1>
                <p class="text-blue-100 text-lg">Tiếp tục hành trình học tập của bạn</p>
                <div class="flex items-center space-x-4 mt-3">
                  <span class="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    🔥 {{ currentStreak() }} ngày liên tiếp
                  </span>
                  <span class="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    ⭐ Level {{ currentLevel() }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="hidden lg:flex items-center space-x-8">
              <div class="text-center">
                <div class="text-3xl font-bold">{{ enrolledCourses().length }}</div>
                <div class="text-sm text-blue-200">Khóa học</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ completedCourses().length }}</div>
                <div class="text-sm text-blue-200">Hoàn thành</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ totalStudyTime() }}h</div>
                <div class="text-sm text-blue-200">Tổng giờ học</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ averageGrade() }}</div>
                <div class="text-sm text-blue-200">Điểm TB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Enhanced Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <!-- Active Courses Card -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 group cursor-pointer"
               (click)="goToCourses()">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Khóa học đang theo</p>
                <p class="text-3xl font-bold text-gray-900">{{ enrolledCourses().length }}</p>
                <p class="text-sm text-green-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  +2 mới
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 group cursor-pointer"
               (click)="goToAnalytics()">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Tiến độ trung bình</p>
                <p class="text-3xl font-bold text-gray-900">{{ averageProgress() }}%</p>
                <p class="text-sm text-green-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  +5% tuần này
                </p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Assignments Card -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500 group cursor-pointer"
               (click)="goToAssignments()">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Bài tập chờ làm</p>
                <p class="text-3xl font-bold text-gray-900">{{ pendingAssignments().length }}</p>
                <p class="text-sm text-purple-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                  </svg>
                  {{ urgentAssignments() }} khẩn cấp
                </p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Achievements Card -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500 group cursor-pointer"
               (click)="goToAchievements()">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Thành tích</p>
                <p class="text-3xl font-bold text-gray-900">{{ achievements().length }}</p>
                <p class="text-sm text-orange-600 flex items-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  {{ recentAchievements() }} mới
                </p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column - Continue Learning -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Continue Learning Section -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Tiếp tục học tập</h3>
                <button (click)="goToLearning()" 
                        class="text-blue-600 hover:text-blue-800 font-medium">
                  Xem tất cả →
                </button>
              </div>
              
              <div class="space-y-4">
                @for (course of enrolledCourses().slice(0, 3); track course.id) {
                  <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group cursor-pointer"
                       (click)="continueLearning(course.id)">
                    <img [src]="course.thumbnail" [alt]="course.title" 
                         class="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {{ course.title }}
                      </h4>
                      <p class="text-sm text-gray-600 mb-2">{{ course.instructor }}</p>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{{ course.completedLessons }}/{{ course.totalLessons }} bài học</span>
                        <span>{{ course.duration }}</span>
                        <span class="flex items-center">
                          <svg class="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          {{ course.rating }}
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                             [style.width.%]="course.progress"></div>
                      </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Tiếp tục
                      </button>
                      <button (click)="viewCourseDetail(course.id); $event.stopPropagation()"
                              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Recent Assignments -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Bài tập gần đây</h3>
                <button (click)="goToAssignments()" 
                        class="text-green-600 hover:text-green-800 font-medium">
                  Xem tất cả →
                </button>
              </div>
              
              <div class="space-y-4">
                @for (assignment of pendingAssignments().slice(0, 3); track assignment.id) {
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group cursor-pointer"
                       (click)="viewAssignment(assignment.id)">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                           [class]="getAssignmentIconClass(assignment.type)">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 class="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {{ assignment.title }}
                        </h4>
                        <p class="text-sm text-gray-600">{{ assignment.course }}</p>
                        <div class="flex items-center space-x-2 mt-1">
                          <span class="text-xs px-2 py-1 rounded-full"
                                [class]="getPriorityClass(assignment.priority)">
                            {{ getPriorityText(assignment.priority) }}
                          </span>
                          <span class="text-xs text-gray-500">{{ assignment.dueDate }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            [class]="getStatusClass(assignment.status)">
                        {{ getStatusText(assignment.status) }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Learning Goals -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Mục tiêu học tập</h3>
              <div class="space-y-4">
                @for (goal of learningGoals(); track goal.id) {
                  <div class="p-4 bg-gray-50 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-gray-900">{{ goal.title }}</h4>
                      <span class="text-sm text-gray-500">{{ goal.progress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                           [style.width.%]="goal.progress"></div>
                    </div>
                    <p class="text-sm text-gray-600">{{ goal.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">Mục tiêu: {{ formatDate(goal.targetDate) }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Recent Achievements -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Thành tích gần đây</h3>
              <div class="space-y-3">
                @for (achievement of achievements().slice(0, 3); track achievement.id) {
                  <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span class="text-lg">{{ achievement.icon }}</span>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ achievement.title }}</h4>
                      <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(achievement.earnedAt) }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div class="space-y-3">
                <button (click)="goToQuiz()" 
                        class="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium text-gray-900">Làm Quiz</span>
                </button>
                
                <button (click)="goToCourses()" 
                        class="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium text-gray-900">Khóa học mới</span>
                </button>
                
                <button (click)="goToAnalytics()" 
                        class="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium text-gray-900">Phân tích học tập</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedStudentDashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  protected courseService = inject(CourseService);
  private responsive = inject(ResponsiveService);
  private router = inject(Router);
  private errorService = inject(ErrorHandlingService);

  // Loading state
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

  learningGoals = signal<LearningGoal[]>([
    {
      id: 'goal-1',
      title: 'Hoàn thành chứng chỉ STCW',
      description: 'Đạt được chứng chỉ an toàn hàng hải quốc tế',
      targetDate: new Date('2024-12-31'),
      progress: 60,
      category: 'certification'
    },
    {
      id: 'goal-2',
      title: 'Học 50 giờ trong tháng này',
      description: 'Mục tiêu học tập hàng tháng',
      targetDate: new Date('2024-09-30'),
      progress: 80,
      category: 'study'
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

  averageProgress = computed(() => {
    const courses = this.enrolledCourses();
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length);
  });

  averageGrade = computed(() => {
    // Mock average grade calculation
    return '8.5';
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

  urgentAssignments = computed(() => 
    this.pendingAssignments().filter(assignment => assignment.priority === 'high').length
  );

  recentAchievements = computed(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.achievements().filter(achievement => achievement.earnedAt > oneWeekAgo).length;
  });

  ngOnInit(): void {
    this.loadDashboardData();
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
    console.log('🔧 Enhanced Student Dashboard - Continue learning course:', courseId);
    this.router.navigate(['/learn/course', courseId]).catch(error => {
      this.errorService.handleNavigationError(error, `/learn/course/${courseId}`);
    });
  }

  viewCourseDetail(courseId: string): void {
    console.log('🔧 Enhanced Student Dashboard - View course detail:', courseId);
    this.router.navigate(['/courses', courseId]).catch(error => {
      this.errorService.handleNavigationError(error, `/courses/${courseId}`);
    });
  }

  viewAssignment(assignmentId: string): void {
    console.log('🔧 Enhanced Student Dashboard - View assignment:', assignmentId);
    this.router.navigate(['/student/assignments']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/assignments');
    });
  }

  goToCourses(): void {
    console.log('🔧 Enhanced Student Dashboard - Go to courses');
    this.router.navigate(['/student/courses']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/courses');
    });
  }

  goToLearning(): void {
    console.log('🔧 Enhanced Student Dashboard - Go to learning');
    this.router.navigate(['/student/learning']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/learning');
    });
  }

  goToQuiz(): void {
    console.log('🔧 Enhanced Student Dashboard - Go to quiz');
    this.router.navigate(['/student/quiz']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/quiz');
    });
  }

  goToAssignments(): void {
    console.log('🔧 Enhanced Student Dashboard - Go to assignments');
    this.router.navigate(['/student/assignments']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/assignments');
    });
  }

  goToAnalytics(): void {
    console.log('🔧 Enhanced Student Dashboard - Go to analytics');
    this.router.navigate(['/student/analytics']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/analytics');
    });
  }

  goToAchievements(): void {
    console.log('🔧 Enhanced Student Dashboard - Go to achievements');
    this.router.navigate(['/student/profile']).catch(error => {
      this.errorService.handleNavigationError(error, '/student/profile');
    });
  }

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

  formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN');
  }
}