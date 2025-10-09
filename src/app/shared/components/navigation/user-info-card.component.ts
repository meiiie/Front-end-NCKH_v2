import { Component, input, signal, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MaritimeIconComponent } from './maritime-icons.component';

interface UserInfo {
  name: string;
  studentId: string;
  faculty: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [CommonModule, MaritimeIconComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- User Information Section -->
    <div class="flex-shrink-0 transition-all duration-300"
         [class]="containerClasses()">

      <!-- Section Header - Compact -->
      <div class="flex items-center gap-2 mb-2" *ngIf="!isCollapsed()">
        <div class="w-1.5 h-1.5 bg-[#1A3BAD] rounded-full"></div>
        <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Người dùng</span>
        <div class="flex-1 h-px bg-gradient-to-r from-[#1A3BAD]/30 to-transparent"></div>
      </div>

      <div class="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 relative"
           *ngIf="!isCollapsed()">

        <button (click)="toggleDropdown()"
                class="w-full flex items-center gap-2.5 text-left group">
          <!-- Compact Avatar -->
          <div class="relative flex-shrink-0">
            <div class="w-9 h-9 bg-gradient-to-br from-[#1A3BAD] to-[#3b82f6] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md border border-blue-100 group-hover:shadow-lg transition-all duration-300">
              {{ userInfo().avatar }}
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                 [class]="statusColor()"></div>
          </div>

          <!-- Compact Student Information -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-xs text-gray-900 truncate mb-0.5 group-hover:text-[#1A3BAD] transition-colors">
              {{ userInfo().name }}
            </h3>
            <p class="text-xs text-gray-600 truncate font-medium mb-0.5">{{ userInfo().studentId }}</p>
            <p class="text-xs text-[#1A3BAD] font-medium truncate mb-1.5">{{ userInfo().faculty }}</p>

            <!-- Compact Status Display -->
            <div class="flex items-center gap-1.5 p-1.5 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-md border border-gray-100">
              <div class="w-1.5 h-1.5 rounded-full" [class]="statusColor()"></div>
              <span class="text-xs text-gray-700 font-medium flex-1 truncate">
                {{ statusText() }}
              </span>
            </div>
          </div>

          <div class="text-gray-400 transition-transform duration-300 flex-shrink-0"
               [class]="dropdownIconClasses()">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        <!-- Dropdown Menu -->
        <div class="absolute left-2.5 right-2.5 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50"
             *ngIf="isDropdownOpen()">
          <!-- Header -->
          <div class="px-3 py-2.5 bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white">
            <div class="font-semibold text-xs">{{ userInfo().name }}</div>
            <div class="text-xs text-blue-100">Menu cá nhân</div>
          </div>

          <!-- Menu Items -->
          <div class="py-1.5">
            <button *ngFor="let item of menuItems; trackBy: trackById"
                    (click)="handleMenuClick(item)"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-200 hover:bg-gradient-to-r hover:shadow-sm"
                    [class]="menuItemClasses(item)">
              <div class="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                   [class]="menuIconClasses(item)">
                <app-maritime-icon [iconKey]="item.iconKey"></app-maritime-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-xs truncate">{{ item.label }}</div>
                <div class="text-xs text-gray-500 truncate">{{ item.description }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Collapsed State - Compact Avatar with Tooltip -->
      <div class="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 flex justify-center flex-shrink-0"
           *ngIf="isCollapsed()">
        <div class="relative group px-2 py-2">
          <button (click)="toggleDropdown()"
                  class="w-7 h-7 bg-gradient-to-br from-[#1A3BAD] to-[#3b82f6] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 border border-white">
            {{ userInfo().avatar }}
          </button>
          <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm"
               [class]="statusColor()"></div>

          <!-- Hover Tooltip - only show when dropdown is closed -->
          <div class="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-40 shadow-xl border border-gray-700"
               *ngIf="!isDropdownOpen()">
            <div class="font-semibold text-xs">{{ userInfo().name }}</div>
            <div class="text-xs text-gray-300">{{ userInfo().studentId }}</div>
            <div class="text-xs text-blue-200">{{ userInfo().faculty }}</div>
            <div class="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
          </div>

          <!-- Dropdown for collapsed state -->
          <div class="absolute left-full ml-3 mt-0 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[220px] overflow-hidden animate-in slide-in-from-left-2 duration-200 z-50"
               *ngIf="isDropdownOpen()">
            <!-- Header -->
            <div class="px-3 py-2.5 bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white">
              <div class="font-semibold text-xs">{{ userInfo().name }}</div>
              <div class="text-xs text-blue-100">{{ userInfo().studentId }}</div>
            </div>

            <!-- Menu Items -->
            <div class="py-1.5">
              <button *ngFor="let item of menuItems; trackBy: trackById"
                      (click)="handleMenuClick(item)"
                      class="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-200 hover:bg-gradient-to-r hover:shadow-sm"
                      [class]="menuItemClasses(item)">
                <div class="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                     [class]="menuIconClasses(item)">
                  <app-maritime-icon [iconKey]="item.iconKey"></app-maritime-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-xs truncate">{{ item.label }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ item.description }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoCardComponent {
  protected authService = inject(AuthService);

  userInfo = input.required<UserInfo>();
  isCollapsed = input.required<boolean>();

  isDropdownOpen = signal(false);

  menuItems = [
    {
      id: 'profile',
      label: 'Hồ sơ thủy thủ',
      description: 'Quản lý thông tin cá nhân',
      iconKey: 'user' as const,
      action: () => console.log('Navigate to profile'),
    },
    {
      id: 'settings',
      label: 'Cài đặt hệ thống',
      description: 'Tùy chỉnh ứng dụng',
      iconKey: 'settings' as const,
      action: () => console.log('Navigate to settings'),
    },
    {
      id: 'logout',
      label: 'Rời khỏi Cảng',
      description: 'Đăng xuất khỏi hệ thống',
      iconKey: 'log-out' as const,
      action: () => this.logout(),
      isDanger: true,
    },
  ];

  // Computed classes
  containerClasses = () => ({
    'px-3 py-2.5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200': !this.isCollapsed(),
    'px-2 py-2': this.isCollapsed()
  });

  statusColor = () => {
    const status = this.userInfo().status;
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  statusText = () => {
    const status = this.userInfo().status;
    switch (status) {
      case 'online': return 'Đang hoạt động';
      case 'away': return 'Tạm vắng';
      case 'offline': return 'Ngoại tuyến';
      default: return 'Không xác định';
    }
  };

  dropdownIconClasses = () => ({
    'rotate-180 text-[#1A3BAD]': this.isDropdownOpen(),
    'group-hover:text-[#1A3BAD]': !this.isDropdownOpen()
  });

  menuItemClasses = (item: any) => ({
    'hover:from-red-50 hover:to-red-100 text-red-600 hover:text-red-700': item.isDanger,
    'hover:from-[#1A3BAD]/5 hover:to-[#FFC107]/5 text-gray-700 hover:text-[#1A3BAD]': !item.isDanger,
    'border-b border-gray-100': true
  });

  menuIconClasses = (item: any) => ({
    'bg-red-100 text-red-600': item.isDanger,
    'bg-gray-100 text-[#1A3BAD]': !item.isDanger
  });

  toggleDropdown(): void {
    this.isDropdownOpen.update(open => !open);
  }

  handleMenuClick(item: any): void {
    item.action();
    this.isDropdownOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  trackById = (index: number, item: any): string => {
    return item.id;
  };
}