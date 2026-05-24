import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type StarRatingSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-star-rating',
  imports: [IconComponent],
  host: { class: 'block' },
  template: `
    <div class="flex items-center">
      @for (star of starsArray(); track star.index) {
        <ml-icon
          name="star"
          [class]="iconClass()"
          [class.text-fg]="star.filled"
          [class.text-fg-subtle]="!star.filled"
        />
      }
    </div>
  `,
})
export class StarRatingComponent {
  rating = input.required<number>();
  size = input<StarRatingSize>('md');

  starsArray = computed(() => {
    const decimal = this.rating() % 1;
    const roundedRating =
      decimal === 0.5 ? Math.floor(this.rating()) : Math.round(this.rating());
    return Array.from({ length: 5 }, (_, index) => ({
      filled: index < roundedRating,
      index: index + 1,
    }));
  });

  protected readonly iconClass = computed(() => {
    const map: Record<StarRatingSize, string> = {
      sm: 'h-4 w-4 flex-shrink-0',
      md: 'h-5 w-5 flex-shrink-0',
      lg: 'h-6 w-6 flex-shrink-0',
    };
    return map[this.size()];
  });
}
