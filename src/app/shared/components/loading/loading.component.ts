import { Component, input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  template: `
    @if (show()) {
      <div class="loading-container" [class]="getContainerClass()">
        <!-- Spinner -->
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="relative">
            <!-- Main spinner -->
            <div class="animate-spin rounded-full border-4 border-gray-200 h-12 w-12"
                 [class]="getSpinnerClass()">
            </div>
            
            <!-- Inner spinner for double ring effect -->
            <div class="animate-spin rounded-full border-2 border-transparent h-8 w-8 absolute top-2 left-2"
                 [class]="getInnerSpinnerClass()">
            </div>
          </div>
          
          <!-- Loading text -->
          @if (text()) {
            <div class="text-center">
              <p class="text-sm font-medium" [class]="getTextClass()">
                {{ text() }}
              </p>
              @if (subtext()) {
                <p class="text-xs mt-1" [class]="getSubtextClass()">
                  {{ subtext() }}
                </p>
              }
            </div>
          }
          
          <!-- Progress bar (if progress is provided) -->
          @if (progress() !== undefined) {
            <div class="w-48">
              <div class="flex justify-between text-xs mb-1" [class]="getTextClass()">
                <span>{{ progress() }}%</span>
                <span>{{ progressText() || 'Đang tải...' }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-300" 
                     [class]="getProgressBarClass()"
                     [style.width.%]="progress()">
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent {
  // Inputs
  show = input<boolean>(true);
  text = input<string>('Đang tải...');
  subtext = input<string>('');
  progress = input<number>();
  progressText = input<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
  variant = input<'default' | 'overlay' | 'inline'>('default');
  color = input<'blue' | 'green' | 'purple' | 'orange' | 'red'>('blue');

  getContainerClass(): string {
    const baseClasses = 'flex items-center justify-center';
    
    switch (this.variant()) {
      case 'overlay':
        return `${baseClasses} fixed inset-0 bg-black bg-opacity-25 z-50`;
      case 'inline':
        return `${baseClasses} py-8`;
      default:
        return `${baseClasses} min-h-32`;
    }
  }

  getSpinnerClass(): string {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16'
    };
    
    const colorClasses = {
      blue: 'border-blue-600',
      green: 'border-green-600',
      purple: 'border-purple-600',
      orange: 'border-orange-600',
      red: 'border-red-600'
    };
    
    return `${sizeClasses[this.size()]} ${colorClasses[this.color()]}`;
  }

  getInnerSpinnerClass(): string {
    const colorClasses = {
      blue: 'border-blue-400',
      green: 'border-green-400',
      purple: 'border-purple-400',
      orange: 'border-orange-400',
      red: 'border-red-400'
    };
    
    return colorClasses[this.color()];
  }

  getTextClass(): string {
    const colorClasses = {
      blue: 'text-blue-700',
      green: 'text-green-700',
      purple: 'text-purple-700',
      orange: 'text-orange-700',
      red: 'text-red-700'
    };
    
    return colorClasses[this.color()];
  }

  getSubtextClass(): string {
    const colorClasses = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      red: 'text-red-500'
    };
    
    return colorClasses[this.color()];
  }

  getProgressBarClass(): string {
    const colorClasses = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600'
    };
    
    return colorClasses[this.color()];
  }
}