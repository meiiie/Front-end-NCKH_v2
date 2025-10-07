import { LayoutConfig } from './unified-layout.component';
import { studentSidebarConfig } from '../navigation/sidebar.config';
import { teacherSidebarConfig } from '../navigation/sidebar.config';
import { adminSidebarConfig } from '../navigation/sidebar.config';

// Student Layout Configuration
export const studentLayoutConfig: LayoutConfig = {
  sidebarConfig: studentSidebarConfig,
  portalName: 'Student Portal',
  gradientColors: 'from-slate-50 via-blue-50/30 to-indigo-50/50',
  logoColors: 'from-blue-600 to-indigo-600',
  showMobileBottomNav: true,
  hideSidebarRoutes: ['/student/learn/course/'],
  mobileNavItems: [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      routerLink: '/student',
      routerLinkActiveOptions: { exact: true }
    },
    {
      label: 'Khóa học',
      icon: 'courses',
      routerLink: '/student/courses'
    },
    {
      label: 'Bài tập',
      icon: 'assignments',
      routerLink: '/student/assignments',
      badge: '2' // This could be dynamic in the future
    },
    {
      label: 'Học tập',
      icon: 'learning',
      routerLink: '/student/learn'
    },
    {
      label: 'Hồ sơ',
      icon: 'profile',
      routerLink: '/student/profile'
    }
  ]
};

// Teacher Layout Configuration
export const teacherLayoutConfig: LayoutConfig = {
  sidebarConfig: teacherSidebarConfig,
  portalName: 'Teacher Portal',
  gradientColors: 'from-blue-50 via-indigo-50/30 to-purple-50/50',
  logoColors: 'from-indigo-600 to-purple-600',
  showMobileBottomNav: false,
  hideSidebarRoutes: []
};

// Admin Layout Configuration
export const adminLayoutConfig: LayoutConfig = {
  sidebarConfig: adminSidebarConfig,
  portalName: 'Admin Portal',
  gradientColors: 'from-gray-50 via-slate-50/30 to-zinc-50/50',
  logoColors: 'from-gray-600 to-slate-600',
  showMobileBottomNav: false,
  hideSidebarRoutes: []
};