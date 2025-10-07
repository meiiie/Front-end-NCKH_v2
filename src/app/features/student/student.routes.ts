import { Routes } from '@angular/router';
import { studentGuard } from '../../core/guards/role.guard';
import { UnifiedLayoutComponent } from '../../shared/components/layout/unified-layout.component';
import { studentLayoutConfig } from '../../shared/components/layout/layout.configs';

/**
 * Student Routes Configuration
 *
 * Cấu trúc routing đơn giản và chuyên nghiệp cho Student features
 * - Flat structure để dễ maintain
 * - Consistent naming conventions
 * - Clear hierarchy và organization
 * - Proper lazy loading cho performance
 */
export const studentRoutes: Routes = [
  {
    path: '',
    component: UnifiedLayoutComponent,
    data: { config: studentLayoutConfig },
    canActivate: [studentGuard],
    children: [
      // Default redirect to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      
      // Dashboard - Trang chủ học viên
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/enhanced-student-dashboard.component').then(m => m.EnhancedStudentDashboardComponent),
        title: 'Dashboard - Học viên'
      },
      
      // Course Management Routes
      {
        path: 'courses',
        children: [
          {
            path: '',
            loadComponent: () => import('../courses/my-courses.component').then(m => m.MyCoursesComponent),
            title: 'Khóa học của tôi'
          }
        ]
      },
      
      // Assignment Routes
      {
        path: 'assignments',
        children: [
          {
            path: '',
            loadComponent: () => import('../assignments/presentation/pages/assignment-list-page.component').then(m => m.AssignmentListPageComponent),
            title: 'Bài tập của tôi'
          },
          {
            path: ':id/work',
            loadComponent: () => import('../assignments/assignment-work.component').then(m => m.AssignmentWorkComponent),
            title: 'Làm bài tập'
          },
          {
            path: 'work/:id',
            loadComponent: () => import('../assignments/assignment-work.component').then(m => m.AssignmentWorkComponent),
            title: 'Làm bài tập'
          }
        ]
      },
      
      // Learning Routes - Nested under student
      {
        path: 'learn',
        children: [
          {
            path: '',
            loadComponent: () => import('../learning/learning-new.component').then(m => m.LearningNewComponent),
            title: 'Học tập'
          },
          {
            path: 'select',
            loadComponent: () => import('../learning/components/course-selection.component').then(m => m.CourseSelectionComponent),
            title: 'Chọn khóa học - Học viên'
          },
          {
            path: 'course/:id',
            loadComponent: () => import('../learning/components/professional-learning-interface.component').then(m => m.ProfessionalLearningInterfaceComponent),
            title: 'Khóa học - Học viên'
          },
          {
            path: 'planner',
            loadComponent: () => import('../learning/components/study-planner.component').then(m => m.StudyPlannerComponent),
            title: 'Study Planner - Học viên'
          },
          {
            path: 'calendar',
            loadComponent: () => import('../learning/components/learning-calendar.component').then(m => m.LearningCalendarComponent),
            title: 'Learning Calendar - Học viên'
          },
          {
            path: 'notes',
            loadComponent: () => import('../learning/components/note-taking.component').then(m => m.NoteTakingComponent),
            title: 'Ghi chú - Học viên'
          },
          {
            path: 'bookmarks',
            loadComponent: () => import('../learning/components/bookmark-system.component').then(m => m.BookmarkSystemComponent),
            title: 'Bookmarks - Học viên'
          }
        ]
      },
      
      // Quiz Routes
      {
        path: 'quiz',
        children: [
          {
            path: '',
            loadComponent: () => import('../learning/quiz/presentation/components/quiz-list.component').then(m => m.QuizListComponent),
            title: 'Quiz'
          },
          {
            path: 'take/:id',
            loadComponent: () => import('../learning/quiz/presentation/components/quiz-attempt.component').then(m => m.QuizAttemptComponent),
            title: 'Làm Quiz'
          },
          {
            path: 'result',
            loadComponent: () => import('../learning/quiz/presentation/components/quiz-result.component').then(m => m.QuizResultComponent),
            title: 'Kết quả Quiz'
          }
        ]
      },
      
      // Analytics Routes
      {
        path: 'analytics',
        loadComponent: () => import('../analytics/student-analytics.component').then(m => m.StudentAnalyticsComponent),
        title: 'Phân tích học tập'
      },
      
      // Profile Routes
      {
        path: 'profile',
        loadComponent: () => import('../profile/student-profile.component').then(m => m.StudentProfileComponent),
        title: 'Hồ sơ cá nhân'
      },
      
      // Forum Routes
      {
        path: 'forum',
        loadComponent: () => import('../communication/student-forum.component').then(m => m.StudentForumComponent),
        title: 'Diễn đàn'
      },
      
    ]
  }
];