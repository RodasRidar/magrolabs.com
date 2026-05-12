import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-star-rating',
    imports: [CommonModule],
    template: `
    <div class="flex items-center">
      <svg *ngFor="let star of starsArray" 
           class="h-5 w-5 flex-shrink-0" 
           [class.text-black]="star.filled"
           [class.text-gray-300]="!star.filled"
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
           fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  `
})
export class StarRatingComponent {
  rating = input.required<number>();
  size = input<'sm' | 'md' | 'lg'>('md');

  get starsArray(): { filled: boolean; index: number }[] {
    // Lógica de redondeo conservadora:
    // Si el decimal es exactamente .5, redondear hacia abajo
    // Si es mayor a .5, redondear hacia arriba
    // Si es menor a .5, redondear hacia abajo
    const decimal = this.rating() % 1;
    let roundedRating: number;
    
    if (decimal === 0.5) {
      roundedRating = Math.floor(this.rating()); // 4.5 -> 4
    } else {
      roundedRating = Math.round(this.rating()); // 4.6 -> 5, 4.4 -> 4
    }
    
    return Array.from({ length: 5 }, (_, index) => ({
      filled: index < roundedRating,
      index: index + 1
    }));
  }

  get sizeClass(): string {
    switch (this.size()) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  }
} 