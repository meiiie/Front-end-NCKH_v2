import { Component, input, signal, computed, inject, ChangeDetectionStrategy, ViewEncapsulation, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../shared/types/user.types';
import { MaritimeIconComponent } from './maritime-icons.component';
import { UserInfoCardComponent } from './user-info-card.component';
import { adminSidebarConfig } from './sidebar.config';

export interface AdminSidebarMenuItem {
  label: string;
  route: string;
  iconKey: string;
  badge?: string | number;
  children?: AdminSidebarMenuItem[];
  exact?: boolean;
  description?: string;
}

export interface AdminSidebarConfig {
  role: UserRole;
  title: string;
  logoIcon: string;
  menuItems: AdminSidebarMenuItem[];
  collapsible?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterModule, RouterLinkActive, FormsModule, MaritimeIconComponent, UserInfoCardComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Fixed Main Sidebar Container -->
    <aside
      class="fixed top-0 left-0 h-screen bg-white flex flex-col shadow-2xl transition-all duration-500 ease-in-out z-50"
      role="navigation"
      aria-label="Thanh điều hướng quản trị"
      [class]="sidebarClasses()">

      <!-- Professional Toggle Button - Fixed Position as per spec -->
      <button
        (click)="toggleSidebar()"
        class="fixed top-6 z-50 w-6 h-10 bg-gradient-to-b from-[#1A3BAD] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1A3BAD] text-white rounded-r-lg shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-500 ease-in-out border border-l-0 border-[#FFC107]/30 hover:border-[#FFC107]/60"
        [class]="toggleButtonPosition()"
        type="button"
        title="Thu gọn sidebar"
        aria-label="Thu gọn sidebar"
        aria-controls="admin-sidebar"
        [attr.aria-expanded]="!isCollapsed()">
        <svg class="w-3 h-3 transition-transform duration-500 ease-in-out" [class]="toggleIconRotation()" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <!-- LED Accent Border with Pulse Animation -->
      <div class="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1A3BAD] via-[#FFC107] to-[#1A3BAD] shadow-lg shadow-[#1A3BAD]/30 z-10">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse"></div>
      </div>

      <!-- VMU Maritime Header -->
      <header class="flex-shrink-0 bg-gradient-to-br from-[#1A3BAD] via-[#2563eb] to-[#1A3BAD] text-white relative overflow-hidden transition-all duration-500 ease-in-out"
              [class]="headerClasses()">

        <div class="absolute inset-0 bg-gradient-to-br from-[#FFC107]/10 to-transparent"></div>
        <div class="absolute top-0 right-0 w-16 h-16 bg-[#FFC107]/10 rounded-full -translate-y-8 translate-x-8"></div>

        <div class="relative z-10 flex items-center justify-between">
          <!-- VMU Logo & Branding -->
          <div class="flex items-center gap-2 transition-all duration-500">
            <div class="bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20 transition-all duration-500 group hover:bg-white/20"
                 [class]="logoIconClasses()">
              <app-maritime-icon iconKey="university" class="text-white group-hover:scale-110 transition-transform duration-300"></app-maritime-icon>
            </div>

            <div class="flex-1 min-w-0 transition-all duration-500" *ngIf="!isCollapsed()">
              <h1 class="text-base font-bold tracking-tight truncate mb-0.5">
                <span class="text-white">VMU </span>
                <span class="text-[#FFC107]">Portal</span>
              </h1>
              <p class="text-xs text-blue-100/90 truncate font-medium tracking-wide">Hệ thống quản lý</p>
            </div>
          </div>
        </div>

        <div class="relative mt-2 h-px bg-gradient-to-r from-transparent via-[#FFC107]/60 to-transparent">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
        </div>
      </header>

      <!-- User Information Section -->
      <app-user-info-card [userInfo]="userInfo()" [isCollapsed]="isCollapsed()" />

      <!-- Navigation Section -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-[#1A3BAD]/50">
        <!-- Section Divider -->
        <div class="flex items-center transition-all duration-300" [class]="dividerClasses()">
          <div class="w-1.5 h-1.5 bg-[#1A3BAD] rounded-full" *ngIf="!isCollapsed()"></div>
          <div class="flex-1 h-px bg-gradient-to-r from-[#1A3BAD]/30 via-gray-300 to-transparent ml-2" *ngIf="!isCollapsed()"></div>
        </div>

        <!-- Main Navigation -->
        <nav class="flex-1 overflow-hidden transition-all duration-300" [class]="navClasses()">
          <!-- Section Title -->
          <div class="mb-4 px-2" *ngIf="!isCollapsed()">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chức năng chính</h3>
          </div>

          <!-- Navigation Items - Semantic HTML -->
          <ul class="space-y-1" role="list" [class]="navItemsClasses()">
            <li *ngFor="let item of filteredMenuItems(); trackBy: trackByRoute" role="listitem" class="relative">
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: item.exact ?? false}"
                [attr.title]="isCollapsed() ? item.label : undefined"
                class="group flex items-center rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all duration-300"
                [class]="navItemClasses(item)">
                <!-- Active Side Indicator -->
                <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-[#FFC107] rounded-r-full" *ngIf="isActive(item.route) && !isCollapsed()"></div>

                <!-- Icon Container -->
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-md transition-all duration-300 flex-shrink-0"
                      [class]="iconContainerClasses(item)">
                  <app-maritime-icon [iconKey]="item.iconKey || 'dashboard'" [class]="iconClasses(item)"></app-maritime-icon>

                  <!-- Badge for special items -->
                  <span class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-gradient-to-br from-[#FFC107] to-orange-500 border border-white flex items-center justify-center" *ngIf="item.badge === 'new'">
                    <span class="h-1 w-1 rounded-full bg-white"></span>
                  </span>
                </span>

                <!-- Label & Description -->
                <span class="min-w-0 flex-1" *ngIf="!isCollapsed()">
                  <span class="block font-medium text-sm text-slate-900 truncate mb-0.5"
                        [class]="labelClasses(item)">
                    {{ item.label }}
                  </span>
                  <span class="block text-xs text-slate-600 truncate" *ngIf="item.description"
                        [class]="descriptionClasses(item)">
                    {{ item.description }}
                  </span>
                </span>

                <!-- Active Arrow Indicator -->
                <svg class="h-4 w-4 text-[#FFC107] flex-shrink-0" *ngIf="isActive(item.route) && !isCollapsed()" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>

              <!-- Professional Tooltip for collapsed mode -->
              <div class="absolute left-full ml-3 px-3 py-2 bg-[#1A3BAD] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-[#FFC107]/30"
                   *ngIf="isCollapsed()">
                <div class="font-semibold text-sm">{{ item.label }}</div>
                <div class="text-xs text-blue-100 mt-0.5" *ngIf="item.description">{{ item.description }}</div>
                <!-- Tooltip Arrow -->
                <div class="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1A3BAD]"></div>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Bottom Section Divider -->
      <div class="flex items-center transition-all duration-300" [class]="bottomDividerClasses()">
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-[#1A3BAD]/30 mr-2" *ngIf="!isCollapsed()"></div>
        <div class="w-1.5 h-1.5 bg-[#1A3BAD] rounded-full" *ngIf="!isCollapsed()"></div>
      </div>

      <!-- Clean Footer -->
      <footer class="flex-shrink-0 bg-gradient-to-r from-[#1A3BAD]/5 to-[#FFC107]/5 border-t border-gray-200/50 transition-all duration-300"
              [class]="footerClasses()">
        <div class="text-center" *ngIf="!isCollapsed()">
          <p class="text-xs text-gray-500 font-medium">© 2025 VMU Portal</p>
          <p class="text-xs text-gray-400 mt-0.5">Trường ĐH Hàng hải Việt Nam</p>
        </div>
        <div class="flex justify-center" *ngIf="isCollapsed()">
          <div class="w-2 h-2 bg-[#1A3BAD] rounded-full opacity-60"></div>
        </div>
      </footer>

      <!-- Bottom LED Accent -->
      <div class="h-1 bg-gradient-to-r from-[#1A3BAD] via-[#FFC107] to-[#1A3BAD] shadow-inner"></div>
    </aside>
  `,
  styles: [`
    /* Minimal custom styles for maritime sidebar - only what's needed beyond Tailwind */
    .maritime-sidebar {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Respect user preferences for reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .maritime-sidebar * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent implements OnInit {
  protected authService = inject(AuthService);
  private router = inject(Router);

  config = input.required<AdminSidebarConfig>();
  // Use the imported adminSidebarConfig as default
  protected adminSidebarConfig = adminSidebarConfig;
  isCollapsed = signal(false);
  searchQuery = signal('');
  isTransitioning = signal(false);

  currentUser = computed(() => this.authService.currentUser());

  // User info for the card
  userInfo = computed(() => ({
    name: this.currentUser()?.fullName || 'Admin User',
    studentId: this.currentUser()?.studentId || 'ADMIN001',
    faculty: 'Quản trị hệ thống',
    avatar: this.currentUser()?.fullName?.charAt(0) || 'A',
    status: 'online' as const
  }));

  // Computed classes for dynamic styling
  toggleButtonPosition = computed(() =>
    this.isCollapsed() ? 'left-16' : 'left-64'
  );

  toggleIconRotation = computed(() =>
    this.isCollapsed() ? 'rotate-0' : 'rotate-180'
  );

  sidebarClasses = computed(() =>
    this.isCollapsed()
      ? 'w-16'
      : 'w-64 lg:w-72'
  );

  headerClasses = computed(() =>
    this.isCollapsed() ? 'px-2 py-3' : 'px-3 py-4'
  );

  logoIconClasses = computed(() =>
    this.isCollapsed() ? 'w-8 h-8' : 'w-10 h-10'
  );

  dividerClasses = computed(() =>
    this.isCollapsed() ? 'px-2 py-2' : 'px-4 py-2'
  );

  navClasses = computed(() =>
    this.isCollapsed() ? 'px-1 py-3' : 'px-3 py-4'
  );

  navItemsClasses = computed(() =>
    this.isCollapsed() ? 'space-y-2' : ''
  );

  bottomDividerClasses = computed(() =>
    this.isCollapsed() ? 'px-2 py-2' : 'px-4 py-2'
  );

  footerClasses = computed(() =>
    this.isCollapsed() ? 'px-2 py-2' : 'px-4 py-3'
  );

  filteredMenuItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.config().menuItems;
    }

    return this.config().menuItems.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.children?.some(child => child.label.toLowerCase().includes(query))
    );
  });

  // Helper methods
  navItemClasses = (item: AdminSidebarMenuItem) => {
    const isActive = this.isActive(item.route);
    return {
      'gap-3 px-3 py-3 h-14': !this.isCollapsed(),
      'justify-center px-1 py-3 h-12': this.isCollapsed(),
      'bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white shadow-lg shadow-[#1A3BAD]/25 border border-[#FFC107]/30': isActive,
      'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#1A3BAD]/5 hover:shadow-md hover:scale-[1.01] border border-transparent hover:border-[#1A3BAD]/20': !isActive
    };
  };

  iconContainerClasses = (item: AdminSidebarMenuItem) => {
    const isActive = this.isActive(item.route);
    return {
      'w-10 h-10': !this.isCollapsed(),
      'w-8 h-8': this.isCollapsed(),
      'bg-slate-200 text-slate-700': isActive,
      'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700': !isActive
    };
  };

  iconClasses = (item: AdminSidebarMenuItem) => {
    return {
      'transition-all duration-300 w-4 h-4': true
    };
  };

  labelClasses = (item: AdminSidebarMenuItem) => {
    const isActive = this.isActive(item.route);
    return {
      'text-slate-900': isActive,
      'text-slate-700 group-hover:text-slate-900': !isActive
    };
  };

  descriptionClasses = (item: AdminSidebarMenuItem) => {
    const isActive = this.isActive(item.route);
    return {
      'text-slate-600': isActive,
      'text-slate-500 group-hover:text-slate-600': !isActive
    };
  };

  isActive = (route: string): boolean => {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  };

  trackByRoute = (index: number, item: AdminSidebarMenuItem): string => {
    return item.route;
  };

  ngOnInit(): void {
    // Maritime icons are handled by MaritimeIconComponent
  }

  toggleSidebar(): void {
    this.isTransitioning.set(true);
    const newCollapsedState = !this.isCollapsed();

    // Smooth transition timing
    setTimeout(() => {
      this.isCollapsed.set(newCollapsedState);
      localStorage.setItem("vmu-sidebar-collapsed", JSON.stringify(newCollapsedState));

      // Notify host application
      window.dispatchEvent(
        new CustomEvent("vmu:sidebar:toggle", {
          detail: { isCollapsed: newCollapsedState },
        }),
      );

      setTimeout(() => this.isTransitioning.set(false), 150);
    }, 50);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  getRoleDisplayName(): string {
    const role = this.config().role;
    switch (role) {
      case UserRole.ADMIN:
        return 'Quản trị viên';
      case UserRole.TEACHER:
        return 'Giảng viên';
      case UserRole.STUDENT:
        return 'Học viên';
      default:
        return 'Người dùng';
    }
  }

  logout(): void {
    this.authService.logout();
  }

}