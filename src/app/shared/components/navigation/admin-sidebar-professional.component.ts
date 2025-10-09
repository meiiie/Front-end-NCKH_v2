import { Component, input, computed, inject, ChangeDetectionStrategy, ViewEncapsulation, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string | number;
  children?: AdminNavItem[];
}

@Component({
  selector: 'app-admin-sidebar-professional',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Professional Admin Sidebar -->
    <aside
      class="admin-sidebar fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col h-screen z-40 transition-all duration-300 ease-in-out"
      [class]="sidebarClasses()">
      <!-- Header -->
      <header class="border-b border-gray-200 bg-gray-50 transition-all duration-300" [class]="headerClasses()">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-300" [class]="logoIconClasses()">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="transition-all duration-300" *ngIf="!isCollapsed()">
              <h1 class="text-lg font-semibold text-gray-900">VMU Quản trị</h1>
              <p class="text-sm text-gray-500">Cổng quản lý hệ thống</p>
            </div>
          </div>

          <!-- Toggle Button -->
          <button
            (click)="toggleSidebar()"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            [title]="isCollapsed() ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
            aria-label="Toggle sidebar"
          >
            <svg class="w-5 h-5 transition-transform duration-300" [class]="isCollapsed() ? 'rotate-180' : 'rotate-0'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto transition-all duration-300" [class]="navClasses()">
        <ul class="space-y-2" [class]="navItemsClasses()">
          <li *ngFor="let item of navItems()">
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-gray-100 text-gray-900"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 group"
              [title]="isCollapsed() ? item.label : ''"
            >
              <div class="w-5 h-5 flex-shrink-0" [class]="isCollapsed() ? 'mx-auto' : 'mr-3'" [innerHTML]="getIconHtml(item.icon)"></div>
              <span class="flex-1 transition-opacity duration-300" [class]="isCollapsed() ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'">
                {{ item.label }}
              </span>
              <span *ngIf="item.badge && !isCollapsed()" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ item.badge }}
              </span>
            </a>

            <!-- Submenu -->
            <ul *ngIf="item.children && !isCollapsed()" class="ml-8 mt-1 space-y-1">
              <li *ngFor="let child of item.children">
                <a
                  [routerLink]="child.route"
                  routerLinkActive="bg-gray-100 text-gray-900"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  <span class="flex-1">{{ child.label }}</span>
                  <span *ngIf="child.badge" class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {{ child.badge }}
                  </span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- User Section -->
      <div class="border-t border-gray-200 bg-gray-50 transition-all duration-300" [class]="userSectionClasses()">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-sm font-medium text-gray-700">{{ userInitials() }}</span>
          </div>
          <div class="flex-1 min-w-0 transition-all duration-300" *ngIf="!isCollapsed()">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName() }}</p>
            <p class="text-xs text-gray-500">Quản trị viên</p>
          </div>
          <button
            (click)="logout()"
            class="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
            [title]="isCollapsed() ? 'Đăng xuất' : ''"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .admin-sidebar {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Custom scrollbar */
    .admin-sidebar nav::-webkit-scrollbar {
      width: 4px;
    }

    .admin-sidebar nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .admin-sidebar nav::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 2px;
    }

    .admin-sidebar nav::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarProfessionalComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Sidebar state management
  isCollapsed = signal(false);
  isTransitioning = signal(false);

  // Navigation items - clean and professional
  navItems = computed(() => [
    {
      label: 'Bảng điều khiển',
      route: '/admin',
      icon: 'dashboard',
      description: 'Tổng quan hệ thống'
    },
    {
      label: 'Quản lý người dùng',
      route: '/admin/users',
      icon: 'users',
      description: 'Thêm, sửa, xóa người dùng',
      children: [
        { label: 'Tất cả người dùng', route: '/admin/users' },
        { label: 'Giảng viên', route: '/admin/users/teachers' },
        { label: 'Học viên', route: '/admin/users/students' },
        { label: 'Import Excel', route: '/admin/users/import' }
      ]
    },
    {
      label: 'Quản lý khóa học',
      route: '/admin/courses',
      icon: 'courses',
      description: 'Duyệt và quản lý khóa học',
      children: [
        { label: 'Tất cả khóa học', route: '/admin/courses' },
        { label: 'Chờ duyệt', route: '/admin/courses/pending', badge: '5' },
        { label: 'Danh mục', route: '/admin/courses/categories' }
      ]
    },
    {
      label: 'Phân tích',
      route: '/admin/analytics',
      icon: 'analytics',
      description: 'Thống kê và báo cáo'
    },
    {
      label: 'Cài đặt hệ thống',
      route: '/admin/settings',
      icon: 'settings',
      description: 'Cấu hình và bảo trì'
    },
    {
      label: 'Báo cáo',
      route: '/admin/reports',
      icon: 'reports',
      description: 'Xuất báo cáo chi tiết'
    },
    {
      label: 'Thông báo',
      route: '/admin/notifications',
      icon: 'notifications',
      description: 'Quản lý thông báo',
      badge: '3'
    },
    {
      label: 'Nhật ký hệ thống',
      route: '/admin/logs',
      icon: 'logs',
      description: 'Xem nhật ký hoạt động'
    }
  ]);

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.fullName || 'Quản trị viên';
  });

  userInitials = computed(() => {
    const name = this.userName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'Q';
  });

  // Simple icon mapping - using inline SVG for better control
  getIconHtml(iconKey: string): string {
    const icons: Record<string, string> = {
      dashboard: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path></svg>`,
      users: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>`,
      courses: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
      analytics: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`,
      settings: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
      reports: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
      notifications: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5v-2a3 3 0 00-5.356-1.857M15 17H7m8 0v-2c0-.656-.126-1.283-.356-1.857M7 17H2v-2a3 3 0 015.356-1.857M7 17v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-12 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`,
      logs: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`
    };

    return icons[iconKey] || icons['dashboard'];
  }

  // Computed classes for dynamic styling
  sidebarClasses = computed(() =>
    this.isCollapsed()
      ? 'w-16'
      : 'w-72'
  );

  headerClasses = computed(() =>
    this.isCollapsed() ? 'px-3 py-4' : 'px-6 py-4'
  );

  logoIconClasses = computed(() =>
    this.isCollapsed() ? 'w-8 h-8' : 'w-10 h-10'
  );

  navClasses = computed(() =>
    this.isCollapsed() ? 'px-2 py-4' : 'px-4 py-6'
  );

  navItemsClasses = computed(() =>
    this.isCollapsed() ? 'space-y-2' : 'space-y-2'
  );

  userSectionClasses = computed(() =>
    this.isCollapsed() ? 'px-2 py-4' : 'px-4 py-4'
  );

  // Toggle sidebar functionality
  toggleSidebar(): void {
    this.isTransitioning.set(true);
    const newCollapsedState = !this.isCollapsed();

    // Smooth transition timing
    setTimeout(() => {
      this.isCollapsed.set(newCollapsedState);
      localStorage.setItem('vmu-admin-sidebar-collapsed', JSON.stringify(newCollapsedState));

      // Notify parent components about the state change
      window.dispatchEvent(
        new CustomEvent('vmu:admin-sidebar:toggle', {
          detail: { isCollapsed: newCollapsedState }
        })
      );

      setTimeout(() => this.isTransitioning.set(false), 300);
    }, 50);
  }

  ngOnInit(): void {
    // Load saved sidebar state from localStorage
    const savedState = localStorage.getItem('vmu-admin-sidebar-collapsed');
    if (savedState) {
      this.isCollapsed.set(JSON.parse(savedState));
    }

    // Listen for sidebar toggle events from other components
    window.addEventListener('vmu:admin-sidebar:toggle', (event: any) => {
      if (event.detail && typeof event.detail.isCollapsed === 'boolean') {
        this.isCollapsed.set(event.detail.isCollapsed);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}