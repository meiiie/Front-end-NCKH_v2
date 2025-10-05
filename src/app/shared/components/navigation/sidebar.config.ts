import { SidebarConfig, SidebarMenuItem } from './sidebar.component';
import { UserRole } from '../../../shared/types/user.types';

// Student Sidebar Configuration
export const studentSidebarConfig: SidebarConfig = {
  role: UserRole.STUDENT,
  title: 'Student Portal',
  logoIcon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  showProgress: true,
  progressValue: 75,
  progressLabel: 'Tiến độ học tập',
  menuItems: [
    {
      label: 'Dashboard',
      route: '/student',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z',
      exact: true
    },
    {
      label: 'Khóa học',
      route: '/student/courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      label: 'Học tập',
      route: '/student/learn',
      icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3a1 1 0 100 2h6a1 1 0 100-2H9z'
    },
    {
      label: 'Bài tập',
      route: '/student/assignments',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      badge: '2'
    },
    {
      label: 'Quiz',
      route: '/student/quiz',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Thảo luận',
      route: '/student/forum',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      label: 'Phân tích',
      route: '/student/analytics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      label: 'Hồ sơ',
      route: '/student/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    }
  ]
};

// Teacher Sidebar Configuration
export const teacherSidebarConfig: SidebarConfig = {
  role: UserRole.TEACHER,
  title: 'Teacher Portal',
  logoIcon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  menuItems: [
    {
      label: 'Dashboard',
      route: '/teacher/dashboard',
      icon: '🏠'
    },
    {
      label: 'Khóa học',
      route: '/teacher/courses',
      icon: '📚',
      children: [
        {
          label: 'Tạo khóa học',
          route: '/teacher/course-creation',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
        }
      ]
    },
    {
      label: 'Bài tập',
      route: '/teacher/assignments',
      icon: '📋',
      children: [
        {
          label: 'Tạo bài tập',
          route: '/teacher/assignment-creation',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
        }
      ]
    },
    {
      label: 'Học viên',
      route: '/teacher/students',
      icon: '👥'
    },
    {
      label: 'Chấm điểm',
      route: '/teacher/grading',
      icon: '✅',
      children: [
        {
          label: 'Quản lý Rubric',
          route: '/teacher/rubrics',
          icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
        }
      ]
    },
    {
      label: 'Phân tích',
      route: '/teacher/analytics',
      icon: '📊'
    },
    {
      label: 'Thông báo',
      route: '/teacher/notifications',
      icon: '🔔'
    }
  ]
};

// Admin Sidebar Configuration
export const adminSidebarConfig: SidebarConfig = {
  role: UserRole.ADMIN,
  title: 'Admin Portal',
  logoIcon: 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z',
  menuItems: [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: '🏠',
      exact: true
    },
    {
      label: 'Người dùng',
      route: '/admin/users',
      icon: '👥'
    },
    {
      label: 'Khóa học',
      route: '/admin/courses',
      icon: '📚'
    },
    {
      label: 'Phân tích',
      route: '/admin/analytics',
      icon: '📊'
    },
    {
      label: 'Cài đặt hệ thống',
      route: '/admin/settings',
      icon: '⚙️'
    },
    {
      label: 'Báo cáo',
      route: '/admin/reports',
      icon: '📋'
    },
    {
      label: 'Thông báo',
      route: '/admin/notifications',
      icon: '🔔'
    },
    {
      label: 'Nhật ký hệ thống',
      route: '/admin/logs',
      icon: '📝'
    }
  ]
};

// Helper function to get sidebar config by role
export function getSidebarConfig(role: UserRole): SidebarConfig {
  switch (role) {
    case UserRole.STUDENT:
      return studentSidebarConfig;
    case UserRole.TEACHER:
      return teacherSidebarConfig;
    case UserRole.ADMIN:
      return adminSidebarConfig;
    default:
      return studentSidebarConfig; // fallback
  }
}