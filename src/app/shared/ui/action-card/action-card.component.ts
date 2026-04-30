import { Component, computed, input } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'ml-action-card',
  standalone: true,
  imports: [CardComponent],
  host: { class: 'block' },
  template: `
    <ml-card class="h-full" [extraClass]="innerClass()">
      @if (accent()) {
        <div class="bg-gradient-to-r from-[#1f1b19] to-primary-hover px-4 py-2 flex items-center justify-between">
          <ng-content select="[accent]" />
        </div>
      }
      <div class="px-4 py-5 sm:p-6 flex-grow">
        <ng-content />
      </div>
      <div class="px-4 pb-5 sm:px-6 sm:pb-6 mt-auto">
        <ng-content select="[footer]" />
      </div>
    </ml-card>
  `,
})
export class ActionCardComponent {
  accent = input<boolean>(false);

  protected readonly innerClass = computed(() => {
    const ring = this.accent()
      ? 'ring-4 ring-primary ring-opacity-60 shadow-xl'
      : '';
    return `flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${ring}`.trim();
  });
}
