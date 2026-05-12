import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-review-skeleton',
    imports: [CommonModule],
    template: `
    <div class="animate-pulse space-y-6">
      <div *ngFor="let item of skeletonItems" class="py-6 px-4 border-b border-gray-100 last:border-b-0">
        <div class="flex items-center space-x-4">
          <!-- Avatar skeleton -->
          <div class="w-14 h-14 bg-gray-200 rounded-full"></div>
          
          <div class="flex-1 space-y-2">
            <!-- Name skeleton -->
            <div class="h-4 bg-gray-200 rounded w-32"></div>
            
            <!-- Stars skeleton -->
            <div class="flex space-x-1">
              <div *ngFor="let star of [1,2,3,4,5]" class="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <!-- Comment skeleton -->
        <div class="mt-4 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-full"></div>
          <div class="h-3 bg-gray-200 rounded w-4/5"></div>
          <div class="h-3 bg-gray-200 rounded w-3/5"></div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class ReviewSkeletonComponent {
  skeletonItems = Array(3).fill(0); // 6 skeleton items
} 