import { Component, computed, input } from '@angular/core';

export type CardSurface = 'default' | 'alt';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
    selector: 'ml-card',
    imports: [],
    host: { class: 'block' },
    template: `
    <div [class]="cardClass()">
      <ng-content />
    </div>
  `
})
export class CardComponent {
  surface   = input<CardSurface>('default');
  padding   = input<CardPadding>('none');
  extraClass = input<string>('');

  protected readonly cardClass = computed(() => {
    const surfaceClass =
      this.surface() === 'alt' ? 'bg-surface-alt' : 'bg-surface';

    const paddingMap: Record<CardPadding, string> = {
      none: '',
      sm: 'p-4',
      md: 'px-4 py-5 sm:p-6',
      lg: 'px-4 py-6 sm:p-8',
    };

    const parts = [
      surfaceClass,
      'overflow-hidden rounded-lg shadow',
      paddingMap[this.padding()],
      this.extraClass(),
    ].filter(Boolean);

    return parts.join(' ');
  });
}
