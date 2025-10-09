import { Component, ChangeDetectionStrategy, ViewEncapsulation, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AdminSidebarProfessionalComponent } from '../../../../shared/components/navigation/admin-sidebar-professional.component';

@Component({
  selector: 'app-admin-layout-simple',
  imports: [CommonModule, RouterModule, RouterOutlet, AdminSidebarProfessionalComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Professional Admin Sidebar -->
      <app-admin-sidebar-professional></app-admin-sidebar-professional>

      <!-- Main content area with dynamic left margin -->
      <main class="min-h-screen overflow-auto transition-all duration-300 ease-in-out" [class]="mainContentClasses()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutSimpleComponent implements OnInit {
  // Sidebar state - synced with sidebar component
  sidebarCollapsed = signal(false);

  // Dynamic classes for main content
  mainContentClasses = computed(() =>
    this.sidebarCollapsed() ? 'ml-16' : 'ml-72'
  );

  ngOnInit(): void {
    // Listen for sidebar toggle events
    window.addEventListener('vmu:admin-sidebar:toggle', (event: any) => {
      if (event.detail && typeof event.detail.isCollapsed === 'boolean') {
        this.sidebarCollapsed.set(event.detail.isCollapsed);
      }
    });

    // Initialize from localStorage
    const savedState = localStorage.getItem('vmu-admin-sidebar-collapsed');
    if (savedState) {
      this.sidebarCollapsed.set(JSON.parse(savedState));
    }
  }
}