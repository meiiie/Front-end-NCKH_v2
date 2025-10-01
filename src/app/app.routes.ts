import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomepageLayoutComponent } from './shared/components/layout/homepage-layout/homepage-layout.component';

/**
 * Main Application Routes Configuration
 * 
 * Cấu trúc routing đơn giản và chuyên nghiệp:
 * - Public routes (homepage layout)
 * - Role-based routes (teacher, student, admin)
 * - Other authenticated routes
 * - Fallback route
 */
export const routes: Routes = [
  // ========================================
  // PUBLIC ROUTES (Homepage Layout)
  // ========================================
  {
    path: '',
    component: HomepageLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home-simple.component').then(m => m.HomeSimpleComponent),
        title: 'Trang chủ - LMS Maritime'
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent),
        title: 'Khóa học - LMS Maritime'
      },
      // Category Landing Pages
      {
        path: 'courses/safety',
        loadComponent: () => import('./features/courses/category/safety-category.component').then(m => m.SafetyCategoryComponent),
        title: 'An toàn Hàng hải - LMS Maritime'
      },
      {
        path: 'courses/navigation',
        loadComponent: () => import('./features/courses/category/navigation-category.component').then(m => m.NavigationCategoryComponent),
        title: 'Điều khiển Tàu - LMS Maritime'
      },
      {
        path: 'courses/engineering',
        loadComponent: () => import('./features/courses/category/engineering-category.component').then(m => m.EngineeringCategoryComponent),
        title: 'Kỹ thuật Máy tàu - LMS Maritime'
      },
      {
        path: 'courses/logistics',
        loadComponent: () => import('./features/courses/category/logistics-category.component').then(m => m.LogisticsCategoryComponent),
        title: 'Logistics Hàng hải - LMS Maritime'
      },
      {
        path: 'courses/law',
        loadComponent: () => import('./features/courses/category/law-category.component').then(m => m.LawCategoryComponent),
        title: 'Luật Hàng hải - LMS Maritime'
      },
      {
        path: 'courses/certificates',
        loadComponent: () => import('./features/courses/category/certificates-category.component').then(m => m.CertificatesCategoryComponent),
        title: 'Chứng chỉ Chuyên môn - LMS Maritime'
      },
      // Course detail should be after specific category routes to avoid capturing them as IDs
      {
        path: 'courses/:id',
        loadComponent: () => import('./features/courses/course-detail/course-detail-enhanced.component').then(m => m.CourseDetailEnhancedComponent),
        title: 'Chi tiết khóa học - LMS Maritime'
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
        title: 'Giới thiệu - LMS Maritime'
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
        title: 'Liên hệ - LMS Maritime'
      },
      {
        path: 'privacy',
        loadComponent: () => import('./features/privacy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        title: 'Chính sách bảo mật - LMS Maritime'
      },
      {
        path: 'terms',
        loadComponent: () => import('./features/terms/terms-of-service.component').then(m => m.TermsOfServiceComponent),
        title: 'Điều khoản sử dụng - LMS Maritime'
      },
      {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
      },
    ]
  },
  
  
  // ========================================
  // ROLE-BASED ROUTES (Separate Route Files)
  // ========================================
  
  // Teacher Routes - Sử dụng route file riêng
  {
    path: 'teacher',
    loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.teacherRoutes)
  },

  // Student Routes - Sử dụng route file riêng
        {
          path: 'student',
          loadChildren: () => import('./features/student/student.routes').then(m => m.studentRoutes)
        },

  // Admin Routes - Sử dụng route file riêng
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // ========================================
  // OTHER AUTHENTICATED ROUTES
  // ========================================
  
  {
    path: 'learn',
    loadChildren: () => import('./features/learning/learning.routes').then(m => m.learningRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'communication',
    loadChildren: () => import('./features/communication/communication.routes').then(m => m.communicationRoutes),
    canActivate: [authGuard]
  },

  
  // ========================================
  // FALLBACK ROUTE
  // ========================================
  
  {
    path: '**',
    redirectTo: ''
  }
];