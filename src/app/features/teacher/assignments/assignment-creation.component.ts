import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignment-creation',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Assignment Creation</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">Assignment creation functionality coming soon...</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentCreationComponent {
  constructor() {}
}