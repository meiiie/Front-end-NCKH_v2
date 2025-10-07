import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../navigation/sidebar.component';
import { UserRole } from '../../../shared/types/user.types';

// Layout configuration interface
export interface LayoutConfig {
  sidebarConfig: any; // SidebarConfig type from sidebar.config
  portalName: string;
  gradientColors: string;
  logoColors: string;
  showMobileBottomNav?: boolean;
  mobileNavItems?: MobileNavItem[];
  hideSidebarRoutes?: string[];
}

export interface MobileNavItem {
  label: string;
  icon: string;
  routerLink: string;
  routerLinkActiveOptions?: any;
  badge?: string;
}

@Component({
  selector: 'app-unified-layout',
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Dynamic gradient background based on role -->
    <div [class]="backgroundGradientClass() + ' min-h-screen flex flex-col'">
      <!-- Desktop Sidebar - Full Height -->
      <div class="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40"
           *ngIf="!shouldHideSidebar()">
        <app-sidebar [config]="config.sidebarConfig"></app-sidebar>
      </div>

      <!-- Mobile sidebar overlay with backdrop blur -->
      <div *ngIf="isMobileSidebarOpen() && !shouldHideSidebar()"
           class="fixed inset-0 z-50 lg:hidden"
           (click)="toggleMobileSidebar()">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20">
          <app-sidebar [config]="config.sidebarConfig"></app-sidebar>
        </div>
      </div>

      <!-- Main content area -->
      <div [class]="shouldHideSidebar() ? 'flex flex-col flex-1 min-h-0' : 'lg:pl-72 flex flex-col flex-1 min-h-0'">
        <!-- Modern top navigation bar - Mobile only -->
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 lg:hidden shadow-sm">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center space-x-3">
                <!-- Modern hamburger menu -->
                <button (click)="toggleMobileSidebar()"
                        class="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <!-- Dynamic logo/brand based on role -->
                <div class="flex items-center space-x-2">
                  <div [class]="'w-8 h-8 rounded-lg flex items-center justify-center ' + config.logoColors">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <h1 class="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {{ config.portalName }}
                  </h1>
                </div>
              </div>

              <!-- Modern user menu -->
              <div class="flex items-center space-x-3">
                <!-- User avatar and info -->
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ getUserInitials() }}
                  </div>
                  <div class="hidden sm:block">
                    <p class="text-sm font-medium text-gray-900">{{ authService.currentUser()?.fullName }}</p>
                    <p class="text-xs text-gray-500">{{ getRoleDisplayName() }}</p>
                  </div>
                </div>

                <!-- Modern logout button -->
                <button (click)="logout()"
                        class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/20">
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Page content with modern spacing -->
        <main class="flex-1 overflow-auto bg-transparent">
          <div class="py-6 px-4 sm:px-6 lg:px-8">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- Mobile Bottom Navigation - Only for Student -->
        <nav *ngIf="config.showMobileBottomNav && !shouldHideSidebar()" class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
          <div class="flex items-center justify-around px-2 py-2">
            <a *ngFor="let item of config.mobileNavItems"
               [routerLink]="item.routerLink"
               routerLinkActive="text-blue-600"
               [routerLinkActiveOptions]="item.routerLinkActiveOptions"
               class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 relative">
              <div class="w-6 h-6 mb-1" [innerHTML]="getIconHtml(item.icon)"></div>
              <span class="text-xs font-medium">{{ item.label }}</span>
              <div *ngIf="item.badge" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">{{ item.badge }}</span>
              </div>
            </a>
          </div>
        </nav>

        <!-- Add bottom padding for mobile navigation -->
        <div *ngIf="config.showMobileBottomNav && !shouldHideSidebar()" class="h-20 lg:hidden"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnifiedLayoutComponent implements OnInit, OnDestroy {
  protected config!: LayoutConfig;

  protected authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected isMobileSidebarOpen = signal(false);

  // Sidebar visibility state persisted in localStorage
  private sidebarHidden = signal<boolean>(false);

  // Computed background gradient based on config
  protected backgroundGradientClass = computed(() => {
    return `bg-gradient-to-br ${this.config.gradientColors}`;
  });

  // Hide sidebar when in learning interface for focused experience (Student only)
  protected shouldHideSidebar = computed(() => {
    if (this.config.hideSidebarRoutes && this.config.hideSidebarRoutes.length > 0) {
      return this.sidebarHidden() || this.isInHiddenRoute();
    }
    return this.sidebarHidden();
  });

  private routerSubscription?: Subscription;

  ngOnInit() {
    // Get config from route data
    this.config = this.route.snapshot.data['config'];

    // Load sidebar state from localStorage on initialization
    this.loadSidebarState();

    // Subscribe to router events to detect navigation changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleRouteChange(event.urlAfterRedirects);
      });

    // Handle initial route
    this.handleRouteChange(this.router.url);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private handleRouteChange(url: string) {
    if (this.config.hideSidebarRoutes) {
      const isInLearningInterface = this.config.hideSidebarRoutes.some(route => url.includes(route));
      const isCurrentlyHidden = this.sidebarHidden();

      // Auto-hide sidebar when entering learning interface
      if (isInLearningInterface && !isCurrentlyHidden) {
        this.sidebarHidden.set(true);
        this.saveSidebarState(true);
      }
      // Auto-show sidebar when leaving learning interface
      else if (!isInLearningInterface && isCurrentlyHidden) {
        this.sidebarHidden.set(false);
        this.saveSidebarState(false);
      }
    }
  }

  private isInHiddenRoute(): boolean {
    if (!this.config.hideSidebarRoutes) return false;
    return this.config.hideSidebarRoutes.some(route => this.router.url.includes(route));
  }

  private saveSidebarState(hidden: boolean): void {
    const storageKey = `${this.getRoleFromConfig()}_sidebar_hidden`;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(storageKey, hidden.toString());
    }
  }

  private loadSidebarState(): void {
    const storageKey = `${this.getRoleFromConfig()}_sidebar_hidden`;
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        this.sidebarHidden.set(saved === 'true');
      }
    }
  }

  private getRoleFromConfig(): string {
    // Extract role from portal name or config
    if (this.config.portalName.toLowerCase().includes('student')) return 'student';
    if (this.config.portalName.toLowerCase().includes('teacher')) return 'teacher';
    if (this.config.portalName.toLowerCase().includes('admin')) return 'admin';
    return 'user';
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleDisplayName(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case UserRole.STUDENT: return 'Học viên';
      case UserRole.TEACHER: return 'Giảng viên';
      case UserRole.ADMIN: return 'Quản trị viên';
      default: return 'Người dùng';
    }
  }

  getIconHtml(iconName: string): string {
    const icons: Record<string, string> = {
      dashboard: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
      </svg>`,
      courses: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>`,
      assignments: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>`,
      learning: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3a1 1 0 100 2h6a1 1 0 100-2H9z"></path>
      </svg>`,
      profile: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>`
    };
    return icons[iconName] || '';
  }
}